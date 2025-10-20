# bootstrap.py
from __future__ import annotations


import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional
from urllib.parse import urlparse

from .nexus_config import SecretResolver
from .nexus_engine import ModelConnector

__all__ = ["BootstrapError", "make_connectors", "_make_connectors"]


class BootstrapError(RuntimeError):
    """Raised when production bootstrap prerequisites are not met."""


log = logging.getLogger("nexus.bootstrap")
if not log.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(asctime)s] %(levelname)s %(name)s: %(message)s"))
    log.addHandler(handler)
log.setLevel(logging.INFO)


def _dedupe(seq: Iterable[str]) -> List[str]:
    result: List[str] = []
    seen = set()
    for item in seq:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def _is_https(url: Optional[str]) -> bool:
    if not url or not isinstance(url, str):
        return False
    try:
        parsed = urlparse(url)
    except Exception:
        return False
    return parsed.scheme == "https" and bool(parsed.netloc)


def _coerce_positive_int(raw: Any, *, field: str, minimum: int = 1) -> int:
    try:
        value = int(raw)
    except (TypeError, ValueError) as exc:
        raise BootstrapError(f"{field} must be an integer") from exc
    if value < minimum:
        raise BootstrapError(f"{field} must be >= {minimum}")
    return value


def _provider_list(env_name: str, default_csv: str) -> List[str]:
    raw = os.getenv(env_name, default_csv)
    providers = _dedupe(p.strip().lower() for p in raw.split(",") if p.strip())
    if not providers:
        raise BootstrapError(f"{env_name} produced no secret providers")
    return providers


def _collect_secret_overrides(cfg: Optional[Any]) -> Dict[str, str]:
    overrides: Dict[str, str] = {}
    cfg_overrides = getattr(cfg, "secret_overrides", None)
    if isinstance(cfg_overrides, dict):
        overrides.update({str(k): str(v) for k, v in cfg_overrides.items() if v is not None})
    for key, value in os.environ.items():
        if key.startswith("NEXUS_SECRET_"):
            overrides[key] = value
    for passthrough in ("AZURE_KEYVAULT_URL", "GCP_PROJECT"):
        env_val = os.getenv(passthrough)
        if env_val:
            overrides[passthrough] = env_val
    return overrides


def _build_resolver(cfg: Optional[Any] = None) -> SecretResolver:
    cfg_providers = getattr(cfg, "secret_providers", None)
    if cfg_providers:
        providers = _dedupe(
            p.strip().lower() for p in cfg_providers if isinstance(p, str) and p.strip()
        )
        if not providers:
            raise BootstrapError("secret_providers from configuration must not be empty")
    else:
        providers = _provider_list("NEXUS_SECRETS_PROVIDERS", "aws,azure,gcp")

    ttl_env = os.getenv("NEXUS_SECRET_TTL_SECONDS")
    if ttl_env is not None:
        ttl = _coerce_positive_int(ttl_env, field="NEXUS_SECRET_TTL_SECONDS")
    else:
        cfg_ttl = getattr(cfg, "secret_ttl_seconds", None)
        ttl = _coerce_positive_int(
            cfg_ttl if cfg_ttl is not None else 600,
            field="secret_ttl_seconds",
        )

    overrides = _collect_secret_overrides(cfg)
    return SecretResolver(providers=providers, overrides=overrides, ttl_seconds=ttl)


def _read_file(path: Path) -> str:
    try:
        return path.read_text("utf-8")
    except FileNotFoundError as exc:
        raise BootstrapError(f"Catalog file '{path}' does not exist") from exc
    except OSError as exc:
        raise BootstrapError(f"Unable to read catalog file '{path}': {exc}") from exc


def _parse_catalog_json(raw: str, *, source: str) -> Dict[str, Any]:
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise BootstrapError(f"{source} must contain valid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise BootstrapError(f"{source} must decode to a JSON object")
    return payload


def _extract_field(node: Dict[str, Any], field: str, *, source: str) -> Any:
    current: Any = node
    for part in field.split("."):
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            raise BootstrapError(f"Field '{field}' not found in {source}")
    return current


def _ensure_catalog_payload(payload: Any, *, source: str) -> Dict[str, Any]:
    if isinstance(payload, dict):
        return payload
    if isinstance(payload, str):
        return _parse_catalog_json(payload, source=source)
    raise BootstrapError(f"{source} must provide a JSON object or string")


def _catalog_from_cfg(cfg: Optional[Any]) -> Optional[Dict[str, Any]]:
    if not cfg:
        return None
    if hasattr(cfg, "model_catalog") and isinstance(cfg.model_catalog, dict):  # type: ignore[attr-defined]
        return cfg.model_catalog  # type: ignore[attr-defined]
    for attr in ("model_catalog_path", "models_path"):
        path = getattr(cfg, attr, None)
        if path:
            return _parse_catalog_json(
                _read_file(Path(path)), source=f"configuration attribute '{attr}'"
            )
    for attr in ("model_catalog_json", "models_json"):
        raw = getattr(cfg, attr, None)
        if raw:
            return _parse_catalog_json(str(raw), source=f"configuration attribute '{attr}'")
    return None


def _load_catalog(resolver: SecretResolver, cfg: Optional[Any]) -> Dict[str, Any]:
    cfg_catalog = _catalog_from_cfg(cfg)
    if cfg_catalog is not None:
        return cfg_catalog

    path_env = os.getenv("NEXUS_MODELS_PATH")
    if path_env:
        return _parse_catalog_json(_read_file(Path(path_env)), source="NEXUS_MODELS_PATH")

    raw_env = os.getenv("NEXUS_MODELS_JSON")
    if raw_env:
        return _parse_catalog_json(raw_env, source="NEXUS_MODELS_JSON")

    doc = resolver.get("MODELS_JSON")
    if not doc:
        raise BootstrapError(
            "Model catalog not found. Set NEXUS_MODELS_JSON, NEXUS_MODELS_PATH, "
            "or configure MODELS_JSON in your secrets manager."
        )

    payload = _ensure_catalog_payload(doc, source="secret MODELS_JSON")

    field = os.getenv("NEXUS_SECRET_MODELS_JSON_FIELD")
    if field:
        payload = _extract_field(payload, field, source="secret MODELS_JSON")

    return _ensure_catalog_payload(payload, source="resolved MODELS_JSON")


def _resolve_auth_token(resolver: SecretResolver, auth: Dict[str, Any]) -> str:
    if "value" in auth and auth["value"] is not None:
        return str(auth["value"])
    secret = auth.get("secret")
    if not secret:
        raise BootstrapError("auth.secret or auth.value is required")
    token = resolver.get(str(secret))
    if not token:
        raise BootstrapError(f"Secret '{secret}' could not be resolved")
    return str(token)


def _normalize_headers(headers: Any, *, model_name: str) -> Dict[str, str]:
    if headers is None:
        return {}
    if not isinstance(headers, dict):
        raise BootstrapError(f"Model '{model_name}' headers must be a mapping")
    normalized: Dict[str, str] = {}
    for key, value in headers.items():
        if value is None:
            continue
        if not isinstance(key, str):
            raise BootstrapError(f"Model '{model_name}' header keys must be strings")
        normalized[key] = str(value)
    return normalized


def _headers_for_model(resolver: SecretResolver, model: Dict[str, Any]) -> Dict[str, str]:
    name = str(model.get("name", "")) or "<unnamed>"
    headers = _normalize_headers(model.get("headers"), model_name=name)
    auth = model.get("auth")
    if not isinstance(auth, dict):
        raise BootstrapError(f"Model '{name}' is missing an 'auth' block")
    auth_type = str(auth.get("type", "bearer")).lower()
    if auth_type == "bearer":
        headers["Authorization"] = f"Bearer {_resolve_auth_token(resolver, auth)}"
    elif auth_type == "header":
        header_name = str(auth.get("header") or "X-API-Key")
        headers[header_name] = _resolve_auth_token(resolver, auth)
    else:
        raise BootstrapError(f"Unsupported auth.type '{auth_type}' for model '{name}'")
    return headers


def _validate_model_block(model: Dict[str, Any]) -> None:
    name = model.get("name")
    if not isinstance(name, str) or not name.strip():
        raise BootstrapError("Every model must have a non-empty 'name'")
    endpoint = model.get("endpoint")
    if not isinstance(endpoint, str) or not endpoint.strip():
        raise BootstrapError(f"Model '{name}' must define an 'endpoint'")
    if not _is_https(endpoint):
        raise BootstrapError(f"Model '{name}' must use an https:// endpoint")


def _adapter_of(model: Dict[str, Any], defaults: Dict[str, Any]) -> str:
    adapter = model.get("adapter", defaults.get("adapter", "openai.chat"))
    if not isinstance(adapter, str):
        raise BootstrapError(
            f"Adapter for model '{model.get('name', '<unknown>')}' must be a string"
        )
    return adapter


def _int_from_model(
    model: Dict[str, Any],
    key: str,
    default_val: int,
    *,
    minimum: int,
) -> int:
    value = model.get(key, default_val)
    try:
        num = int(value)
    except (TypeError, ValueError) as exc:
        raise BootstrapError(
            f"Model '{model.get('name', '<unknown>')}' field '{key}' must be an integer"
        ) from exc
    if num < minimum:
        raise BootstrapError(
            f"Model '{model.get('name', '<unknown>')}' field '{key}' must be >= {minimum}"
        )
    return num


def make_connectors(_cfg: Optional[Any] = None) -> Dict[str, ModelConnector]:
    """Build connectors from a dynamic catalog with strict validation."""

    resolver = _build_resolver(_cfg)
    catalog = _load_catalog(resolver, _cfg)
    defaults_node = catalog.get("defaults")
    if defaults_node is None:
        defaults: Dict[str, Any] = {}
    elif isinstance(defaults_node, dict):
        defaults = defaults_node
    else:
        raise BootstrapError("Catalog 'defaults' must be a mapping if provided")

    models = catalog.get("models")
    if not isinstance(models, list) or not models:
        raise BootstrapError("Model catalog must contain a non-empty 'models' array")

    connectors: Dict[str, ModelConnector] = {}
    for model in models:
        if not isinstance(model, dict):
            raise BootstrapError("Each model entry must be a mapping")
        _validate_model_block(model)
        name = str(model["name"]).strip()
        if name in connectors:
            raise BootstrapError(f"Duplicate model name '{name}' in catalog")

        endpoint = str(model["endpoint"]).strip()
        timeout = _int_from_model(model, "timeout", int(defaults.get("timeout", 12)), minimum=1)
        max_retries = _int_from_model(
            model, "max_retries", int(defaults.get("max_retries", 3)), minimum=0
        )
        adapter = _adapter_of(model, defaults)
        headers = _headers_for_model(resolver, model)

        try:
            connector = ModelConnector(
                name=name,
                endpoint=endpoint,
                headers=headers,
                timeout=timeout,
                max_retries=max_retries,
                adapter=adapter,
            )
        except TypeError:
            connector = ModelConnector(
                name=name,
                endpoint=endpoint,
                headers=headers,
                timeout=timeout,
                max_retries=max_retries,
            )
        connectors[name] = connector

    log.info("Built %d connectors: %s", len(connectors), ", ".join(sorted(connectors.keys())))
    return connectors


def _now_ms() -> int:
    return int(time.time() * 1000)


def _norm(
    *,
    provider: str,
    model: str,
    endpoint: str | None,
    started_ms: int,
    text: str,
    raw: dict | str | None = None,
    usage: dict | None = None,
    finish_reason: str | None = None,
):
    meta: Dict[str, Any] = {
        "provider": provider,
        "model": model,
        "latency_ms": _now_ms() - started_ms,
        "usage": usage or {},
    }
    if endpoint:
        meta["endpoint"] = endpoint
    if finish_reason:
        meta["finish_reason"] = finish_reason
    if raw is not None:
        meta["raw"] = raw
    return text or "", meta


def _make_connectors(cfg, resolver_like=None):
    """Return lightweight connectors for built-in cloud integrations."""

    import json as _json
    import os as _os
    import requests

    def _https(u: str) -> bool:
        return isinstance(u, str) and u.startswith("https://")

    conns: Dict[str, Any] = {}

    if cfg.engine_mode in {"direct", "mixed"} and cfg.secret_overrides.get("GPT_ENDPOINT"):
        ep = cfg.secret_overrides["GPT_ENDPOINT"]
        key = cfg.secret_overrides.get("OPENAI_API_KEY")
        if _https(ep):
            def _infer_direct(prompt, params=None):
                started = _now_ms()
                resp = requests.post(
                    ep,
                    json={"prompt": prompt, **(params or {})},
                    headers=({"Authorization": f"Bearer {key}"} if key else {}),
                    timeout=30,
                )
                resp.raise_for_status()
                try:
                    payload = resp.json()
                    text = _json.dumps(payload)
                except Exception:
                    payload = resp.text
                    text = resp.text
                return _norm(
                    provider="direct-https",
                    model="custom",
                    endpoint=ep,
                    started_ms=started,
                    text=text,
                    raw=payload,
                )

            conns["DirectHTTPS"] = type(
                "DirectHTTPS",
                (object,),
                {
                    "name": "DirectHTTPS",
                    "infer": staticmethod(lambda prompt, **kwargs: _infer_direct(prompt, kwargs.get("params"))),
                },
            )()

    if (
        cfg.engine_mode in {"delegates", "mixed"}
        and cfg.secret_overrides.get("NEXUS_SECRET_GPT_DELEGATE")
    ):
        spec = cfg.secret_overrides["NEXUS_SECRET_GPT_DELEGATE"]
        if isinstance(spec, str) and spec.startswith("aws:lambda:"):
            try:
                import boto3

                part = spec.split(":", 2)[-1]
                fn, region = (part.split("@") + [_os.getenv("AWS_REGION", "us-east-1")])[:2]
                lam = boto3.client("lambda", region_name=region)

                def _infer_lambda(prompt, params=None):
                    started = _now_ms()
                    payload = _json.dumps({"prompt": prompt, "params": params or {}}).encode("utf-8")
                    body = lam.invoke(FunctionName=fn, Payload=payload)["Payload"].read()
                    try:
                        parsed = _json.loads(body.decode("utf-8"))
                        text = parsed if isinstance(parsed, str) else _json.dumps(parsed)
                    except Exception:
                        parsed = body.decode("utf-8", "replace")
                        text = parsed
                    return _norm(
                        provider="aws-lambda",
                        model="delegate",
                        endpoint=f"lambda://{region}/{fn}",
                        started_ms=started,
                        text=text,
                        raw=parsed,
                    )

                conns["AWSLambdaDelegate"] = type(
                    "LambdaConn",
                    (object,),
                    {
                        "name": f"AWSLambda:{fn}@{region}",
                        "infer": staticmethod(lambda prompt, **kwargs: _infer_lambda(prompt, kwargs.get("params"))),
                    },
                )()
            except Exception:
                pass

    br_model = cfg.secret_overrides.get("BEDROCK_MODEL_ID") or _os.getenv("BEDROCK_MODEL_ID")
    if br_model and cfg.engine_mode in {"direct", "mixed"}:
        try:
            import boto3

            region = (
                cfg.secret_overrides.get("BEDROCK_REGION")
                or _os.getenv("BEDROCK_REGION")
                or _os.getenv("AWS_REGION", "us-east-1")
            )
            runtime = boto3.client("bedrock-runtime", region_name=region)

            class BedrockConn:
                name = f"Bedrock:{br_model}@{region}"
                endpoint = f"bedrock://{region}/{br_model}"

                def infer(self, prompt, *, history=None, model_name=None):
                    started = _now_ms()
                    try:
                        body = {"inputText": prompt}
                        resp = runtime.invoke_model(
                            modelId=br_model, body=_json.dumps(body).encode("utf-8")
                        )
                        payload = _json.loads(resp["body"].read().decode("utf-8"))
                    except Exception:
                        alt = {
                            "messages": [{"role": "user", "content": prompt}],
                            "max_tokens": 512,
                            "temperature": 0.2,
                        }
                        resp = runtime.invoke_model(
                            modelId=br_model, body=_json.dumps(alt).encode("utf-8")
                        )
                        payload = _json.loads(resp["body"].read().decode("utf-8"))

                    text = (
                        payload.get("output_text")
                        or (payload.get("content") or [{}])[0].get("text", "")
                        or payload.get("generation")
                        or payload.get("output", "")
                        or _json.dumps(payload)[:2000]
                    )
                    usage = payload.get("usage") or payload.get("usage_metadata") or {}
                    return _norm(
                        provider="bedrock",
                        model=br_model,
                        endpoint=self.endpoint,
                        started_ms=started,
                        text=text,
                        raw=payload,
                        usage=usage,
                    )

            conns["Bedrock"] = BedrockConn()
        except Exception:
            pass

    az_ep = cfg.secret_overrides.get("AZURE_OPENAI_ENDPOINT") or _os.getenv("AZURE_OPENAI_ENDPOINT")
    az_key = cfg.secret_overrides.get("AZURE_OPENAI_API_KEY") or _os.getenv("AZURE_OPENAI_API_KEY")
    az_dep = (
        cfg.secret_overrides.get("AZURE_OPENAI_DEPLOYMENT")
        or _os.getenv("AZURE_OPENAI_DEPLOYMENT")
    )
    az_ver = (
        cfg.secret_overrides.get("AZURE_OPENAI_API_VERSION")
        or _os.getenv("AZURE_OPENAI_API_VERSION")
        or "2024-07-01-preview"
    )
    if az_ep and az_key and az_dep and cfg.engine_mode in {"direct", "mixed"}:

        def _infer_aoai(prompt, *, history=None, model_name=None):
            started = _now_ms()
            msgs = [{"role": "user", "content": prompt}]
            try:
                from openai import AzureOpenAI

                client = AzureOpenAI(
                    api_key=az_key, api_version=az_ver, azure_endpoint=az_ep
                )
                res = client.chat.completions.create(
                    model=az_dep, messages=msgs, temperature=0.2, max_tokens=512
                )
                text = (
                    res.choices[0].message.content if getattr(res, "choices", []) else ""
                )
                usage: Dict[str, Any] = {}
                try:
                    usage_obj = getattr(res, "usage", None)
                    if usage_obj:
                        usage = {
                            "prompt_tokens": getattr(usage_obj, "prompt_tokens", None),
                            "completion_tokens": getattr(
                                usage_obj, "completion_tokens", None
                            ),
                            "total_tokens": getattr(usage_obj, "total_tokens", None),
                        }
                except Exception:
                    usage = {}
                finish = (
                    res.choices[0].finish_reason if getattr(res, "choices", []) else None
                )
                return _norm(
                    provider="azure-openai",
                    model=az_dep,
                    endpoint=az_ep,
                    started_ms=started,
                    text=text or "",
                    raw=res.model_dump(),
                    usage=usage,
                    finish_reason=finish,
                )
            except Exception:
                url = (
                    f"{az_ep}/openai/deployments/{az_dep}/chat/completions?api-version={az_ver}"
                )
                resp = requests.post(
                    url,
                    headers={"api-key": az_key, "Content-Type": "application/json"},
                    json={"messages": msgs, "temperature": 0.2, "max_tokens": 512},
                    timeout=45,
                )
                resp.raise_for_status()
                payload = resp.json()
                text = ""
                finish = None
                if payload.get("choices"):
                    choice0 = payload["choices"][0]
                    msg = choice0.get("message", {})
                    text = msg.get("content", "") or ""
                    finish = choice0.get("finish_reason")
                usage = payload.get("usage") or {}
                return _norm(
                    provider="azure-openai",
                    model=az_dep,
                    endpoint=az_ep,
                    started_ms=started,
                    text=text,
                    raw=payload,
                    usage=usage,
                    finish_reason=finish,
                )

        conns["AzureOpenAI"] = type(
            "AOAI",
            (object,),
            {"name": f"AzureOpenAI:{az_dep}", "infer": staticmethod(_infer_aoai)},
        )()

    az_inf_ep = cfg.secret_overrides.get("AZURE_INFERENCE_ENDPOINT") or _os.getenv(
        "AZURE_INFERENCE_ENDPOINT"
    )
    az_inf_key = cfg.secret_overrides.get("AZURE_INFERENCE_API_KEY") or _os.getenv(
        "AZURE_INFERENCE_API_KEY"
    )
    if az_inf_ep and az_inf_key and cfg.engine_mode in {"direct", "mixed"}:

        def _infer_foundry(prompt, *, history=None, model_name=None):
            started = _now_ms()
            body = (
                {
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens": 512,
                }
                if "/chat/completions" in az_inf_ep
                else {"input": prompt}
            )
            resp = requests.post(
                az_inf_ep,
                headers={"api-key": az_inf_key, "Content-Type": "application/json"},
                json=body,
                timeout=45,
            )
            resp.raise_for_status()
            payload = resp.json()
            text = (
                (payload.get("choices") or [{}])[0]
                .get("message", {})
                .get("content", "")
                or payload.get("output_text", "")
                or payload.get("output", "")
                or payload.get("result", "")
                or _json.dumps(payload)[:2000]
            )
            usage = payload.get("usage") or {}
            finish = None
            if isinstance(payload.get("choices"), list) and payload["choices"]:
                finish = payload["choices"][0].get("finish_reason")
            return _norm(
                provider="azure-ai-foundry",
                model=payload.get("model") or "inference-endpoint",
                endpoint=az_inf_ep,
                started_ms=started,
                text=text,
                raw=payload,
                usage=usage,
                finish_reason=finish,
            )

        conns["AzureAIFoundry"] = type(
            "AIFoundry",
            (object,),
            {"name": "AzureAIFoundry", "infer": staticmethod(_infer_foundry)},
        )()

    g_proj = cfg.secret_overrides.get("GOOGLE_PROJECT") or _os.getenv("GOOGLE_PROJECT")
    v_loc = cfg.secret_overrides.get("VERTEX_LOCATION") or _os.getenv("VERTEX_LOCATION")
    v_model = cfg.secret_overrides.get("VERTEX_MODEL_ID") or _os.getenv("VERTEX_MODEL_ID")
    if g_proj and v_loc and v_model and cfg.engine_mode in {"direct", "mixed"}:

        def _infer_vertex(prompt, *, history=None, model_name=None):
            started = _now_ms()
            try:
                from vertexai import init as vx_init
                from vertexai.generative_models import GenerationConfig, GenerativeModel

                vx_init(project=g_proj, location=v_loc)
                model = GenerativeModel(v_model)
                gcfg = GenerationConfig(max_output_tokens=512, temperature=0.2)
                resp = model.generate_content([prompt], generation_config=gcfg)
                text = getattr(resp, "text", None)
                if not text:
                    text = ""
                    for candidate in getattr(resp, "candidates", []) or []:
                        content = getattr(candidate, "content", None)
                        parts = getattr(content, "parts", None) or []
                        for part in parts:
                            segment = getattr(part, "text", None)
                            if segment:
                                text += segment
                usage: Dict[str, Any] = {}
                try:
                    usage_meta = getattr(resp, "usage_metadata", None)
                    if usage_meta:
                        usage = {
                            "prompt_tokens": getattr(usage_meta, "prompt_token_count", None)
                            or getattr(usage_meta, "input_token_count", None),
                            "completion_tokens": getattr(
                                usage_meta, "candidates_token_count", None
                            )
                            or getattr(usage_meta, "output_token_count", None),
                            "total_tokens": getattr(usage_meta, "total_token_count", None),
                        }
                except Exception:
                    usage = {}
                return _norm(
                    provider="vertex",
                    model=v_model,
                    endpoint=f"aiplatform://{v_loc}/{v_model}",
                    started_ms=started,
                    text=text or "",
                    raw={"text": text},
                    usage=usage,
                )
            except Exception:
                try:
                    import google.auth
                    from google.auth.transport.requests import AuthorizedSession

                    creds, _ = google.auth.default(
                        scopes=["https://www.googleapis.com/auth/cloud-platform"]
                    )
                    session = AuthorizedSession(creds)
                    url = (
                        f"https://{v_loc}-aiplatform.googleapis.com/v1/"
                        f"projects/{g_proj}/locations/{v_loc}/publishers/google/models/{v_model}:generateContent"
                    )
                    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
                    resp = session.post(url, json=body, timeout=45)
                    resp.raise_for_status()
                    payload = resp.json()
                    text = ""
                    for cand in payload.get("candidates", []):
                        parts = cand.get("content", {}).get("parts", [])
                        for part in parts:
                            segment = part.get("text")
                            if segment:
                                text += segment
                    usage_meta = payload.get("usageMetadata") or {}
                    mapped = (
                        {
                            "prompt_tokens": usage_meta.get("promptTokenCount")
                            or usage_meta.get("inputTokenCount"),
                            "completion_tokens": usage_meta.get("candidatesTokenCount")
                            or usage_meta.get("outputTokenCount"),
                            "total_tokens": usage_meta.get("totalTokenCount"),
                        }
                        if usage_meta
                        else {}
                    )
                    return _norm(
                        provider="vertex",
                        model=v_model,
                        endpoint=f"aiplatform://{v_loc}/{v_model}",
                        started_ms=started,
                        text=text,
                        raw=payload,
                        usage=mapped,
                    )
                except Exception as exc:
                    return _norm(
                        provider="vertex",
                        model=v_model,
                        endpoint=f"aiplatform://{v_loc}/{v_model}",
                        started_ms=started,
                        text=f"[Vertex AI error: {exc}]",
                        raw={"error": str(exc)},
                    )

        conns["VertexAI"] = type(
            "VertexAI",
            (object,),
            {
                "name": f"Vertex:{v_model}@{v_loc}",
                "infer": staticmethod(_infer_vertex),
            },
        )()

    return conns
