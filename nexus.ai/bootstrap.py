# bootstrap.py
from __future__ import annotations
import os, json, logging
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse

from nexus_config import SecretResolver
from nexus_engine import ModelConnector

log = logging.getLogger("nexus.bootstrap")
if not log.handlers:
    h = logging.StreamHandler()
    h.setFormatter(logging.Formatter('[%(asctime)s] %(levelname)s %(name)s: %(message)s'))
    log.addHandler(h)
log.setLevel(logging.INFO)

def _is_https(url: Optional[str]) -> bool:
    if not url or not isinstance(url, str): return False
    try:
        p = urlparse(url); return p.scheme == "https" and bool(p.netloc)
    except Exception:
        return False

def _provider_list(env_name: str, default_csv: str) -> List[str]:
    return [s.strip().lower() for s in os.getenv(env_name, default_csv).split(",") if s.strip()]

def _build_resolver() -> SecretResolver:
    providers = _provider_list("NEXUS_SECRETS_PROVIDERS", "aws,azure,gcp")
    overrides: Dict[str, str] = {k: v for k, v in os.environ.items() if k.startswith("NEXUS_SECRET_")}
    for k in ("AZURE_KEYVAULT_URL", "GCP_PROJECT"):
        if os.getenv(k): overrides[k] = os.getenv(k)  # type: ignore
    ttl = int(os.getenv("NEXUS_SECRET_TTL_SECONDS", "600"))
    return SecretResolver(providers=providers, overrides=overrides, ttl_seconds=ttl)

def _load_catalog(resolver: SecretResolver) -> Dict[str, Any]:
    raw = os.getenv("NEXUS_MODELS_JSON")
    if raw:
        try: return json.loads(raw)
        except Exception as e: raise RuntimeError(f"NEXUS_MODELS_JSON is not valid JSON: {e}")
    doc = resolver.get("MODELS_JSON")
    if not doc:
        raise RuntimeError(
            "Model catalog not found. Set NEXUS_MODELS_JSON (raw JSON) or "
            "provide NEXUS_SECRET_MODELS_JSON (+ optional _FIELD) pointing to your catalog in the cloud secrets manager."
        )
    try: return json.loads(doc)
    except Exception as e: raise RuntimeError(f"Catalog secret content is not valid JSON: {e}")

def _resolve_auth_token(resolver: SecretResolver, auth: Dict[str, Any]) -> str:
    if auth.get("value"): return str(auth["value"])
    sec = auth.get("secret")
    if not sec: raise RuntimeError("auth.secret or auth.value is required")
    tok = resolver.get(str(sec))
    if not tok: raise RuntimeError(f"Secret '{sec}' could not be resolved")
    return tok

def _headers_for_model(resolver: SecretResolver, model: Dict[str, Any]) -> Dict[str, str]:
    headers = dict(model.get("headers") or {})
    auth = model.get("auth")
    if not isinstance(auth, dict): raise RuntimeError(f"Model '{model.get('name')}' is missing 'auth' block")
    atype = (auth.get("type") or "bearer").lower()
    if atype == "bearer":
        headers["Authorization"] = f"Bearer {_resolve_auth_token(resolver, auth)}"
    elif atype == "header":
        headers[auth.get("header") or "X-API-Key"] = _resolve_auth_token(resolver, auth)
    else:
        raise RuntimeError(f"Unsupported auth.type '{atype}' for model '{model.get('name')}'")
    return headers

def _validate_model_block(m: Dict[str, Any]) -> None:
    if not m.get("name"): raise RuntimeError("Every model must have a 'name'")
    if not _is_https(m.get("endpoint")): raise RuntimeError(f"Model '{m.get('name')}' must use an https:// endpoint")

def _adapter_of(model: Dict[str, Any], defaults: Dict[str, Any]) -> str:
    return str(model.get("adapter") or defaults.get("adapter") or "openai.chat")

def _int_or(model: Dict[str, Any], key: str, default_val: int) -> int:
    try: return int(model.get(key, default_val))
    except Exception: return default_val

def make_connectors(_cfg=None) -> Dict[str, ModelConnector]:
    """
    Build connectors from a dynamic catalog.
    Env/Secrets:
      - NEXUS_MODELS_JSON (raw JSON) OR NEXUS_SECRET_MODELS_JSON (+ optional _FIELD)
      - NEXUS_SECRETS_PROVIDERS=aws,azure,gcp (order tried)
      - Per-model secrets referenced by `auth.secret` in the catalog
    """
    resolver = _build_resolver()
    catalog = _load_catalog(resolver)
    defaults = dict(catalog.get("defaults") or {})
    models = catalog.get("models")
    if not isinstance(models, list) or not models:
        raise RuntimeError("Model catalog must contain a non-empty 'models' array")

    connectors: Dict[str, ModelConnector] = {}
    for m in models:
        if not isinstance(m, dict): continue
        _validate_model_block(m)
        name = str(m["name"])
        endpoint = str(m["endpoint"])
        timeout = _int_or(m, "timeout", int(defaults.get("timeout", 12)))
        max_retries = _int_or(m, "max_retries", int(defaults.get("max_retries", 3)))
        adapter = _adapter_of(m, defaults)
        headers = _headers_for_model(resolver, m)

        try:
            conn = ModelConnector(name=name, endpoint=endpoint, headers=headers,
                                  timeout=timeout, max_retries=max_retries, adapter=adapter)
        except TypeError:
            # Backwards compatible with older ModelConnector signature
            conn = ModelConnector(name=name, endpoint=endpoint, headers=headers,
                                  timeout=timeout, max_retries=max_retries)
        connectors[name] = conn

    log.info("Built %d connectors: %s", len(connectors), ", ".join(sorted(connectors.keys())))
    return connectors
