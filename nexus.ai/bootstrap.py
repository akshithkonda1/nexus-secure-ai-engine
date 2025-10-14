# bootstrap.py
from __future__ import annotations


import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional
from urllib.parse import urlparse

from nexus_config import SecretResolver
from nexus_engine import ModelConnector

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


_make_connectors = make_connectors
