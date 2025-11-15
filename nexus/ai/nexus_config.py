from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, Iterable, List, Optional, Tuple
from pathlib import Path
import os
import json
import time
import logging

# Pure, side-effect free

log = logging.getLogger("nexus.config")

__all__ = [
    "ConfigError",
    "NexusConfig",
    "load_config",
    "load_and_validate",
    "save_config",
    "validate_config",
    "SecretResolver",
    "_validate_cloud_credentials",
]


class ConfigError(ValueError):
    """Raised when configuration sources cannot be coerced to the expected types."""


_BOOL_TRUE = {"1", "true", "yes", "y", "on"}
_BOOL_FALSE = {"0", "false", "no", "n", "off"}


@dataclass
class NexusConfig:
    engine_mode: str = "mixed"  # delegates|direct|mixed
    routing_policy: str = "reliability_weighted"  # reliability_weighted|round_robin|first_good
    secret_providers: List[str] = field(default_factory=lambda: ["aws"])  # aws|azure|gcp
    secret_overrides: Dict[str, str] = field(default_factory=dict)
    secret_ttl_seconds: int = 600
    memory_providers: List[str] = field(default_factory=lambda: ["memory"])  # aws|azure|gcp|memory
    memory_fanout_writes: bool = True
    require_any_connector: bool = False
    max_context_messages: int = 12
    alpha_semantic: float = 0.7
    encrypt: bool = True


def _has_override(cfg: "NexusConfig", keys: Iterable[str]) -> bool:
    for key in keys:
        if key in cfg.secret_overrides and str(cfg.secret_overrides[key]).strip():
            return True
        normalized = key.upper()
        if normalized in cfg.secret_overrides and str(cfg.secret_overrides[normalized]).strip():
            return True
    return False


def _validate_cloud_credentials(cfg: NexusConfig) -> List[str]:
    """Validate cloud credentials based on configured providers.

    The checks are intentionally lightweight to surface obviously missing
    credentials before the application attempts to interact with external
    services. They do *not* attempt to verify the authenticity of the
    credentials; instead, they merely confirm that the expected environment
    variables or overrides are populated for the configured providers.
    """

    errs: List[str] = []
    env = os.environ

    def _has_any(keys: Iterable[str]) -> bool:
        for key in keys:
            value = env.get(key)
            if value and value.strip():
                return True
        return False

    # AWS requirements
    if "aws" in (cfg.memory_providers or []):
        if not _has_any(["AWS_REGION", "AWS_DEFAULT_REGION"]):
            errs.append("AWS memory provider requires AWS_REGION or AWS_DEFAULT_REGION")

        has_static_keys = (
            (
                _has_any(["AWS_ACCESS_KEY_ID"]) or _has_override(cfg, ["AWS_ACCESS_KEY_ID"])
            )
            and (
                _has_any(["AWS_SECRET_ACCESS_KEY"]) or _has_override(cfg, ["AWS_SECRET_ACCESS_KEY"])
            )
        )
        has_profile_or_role = _has_any(
            [
                "AWS_PROFILE",
                "AWS_WEB_IDENTITY_TOKEN_FILE",
                "AWS_ROLE_ARN",
            ]
        )
        # IAM roles (EC2, ECS, EKS IRSA, etc.) surface credentials through the
        # metadata service. Unless that service is explicitly disabled, assume
        # it is available so we do not reject valid role-based deployments.
        metadata_disabled_flag = env.get("AWS_EC2_METADATA_DISABLED", "").strip().lower()
        metadata_disabled = metadata_disabled_flag in _BOOL_TRUE
        has_container_credentials = _has_any(
            [
                "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI",
                "AWS_CONTAINER_CREDENTIALS_FULL_URI",
            ]
        )

        if not (has_static_keys or has_profile_or_role or has_container_credentials or not metadata_disabled):
            errs.append(
                "AWS memory provider requires credentials via access keys, profile, role, or metadata service"
            )
    bedrock_flag = env.get("NEXUS_ENABLE_BEDROCK")
    if bedrock_flag and bedrock_flag.lower() not in {"0", "false", "no"}:
        if not _has_any(["AWS_REGION", "AWS_DEFAULT_REGION"]):
            errs.append("Bedrock connector requires AWS_REGION or AWS_DEFAULT_REGION")

    # Azure requirements
    if "azure" in (cfg.memory_providers or []):
        if not _has_any(["AZURE_STORAGE_CONNECTION_STRING"]):
            errs.append(
                "Azure memory provider requires AZURE_STORAGE_CONNECTION_STRING"
            )
    if env.get("AZURE_OPENAI_ENDPOINT"):
        if not (
            _has_any(["AZURE_OPENAI_API_KEY"]) or _has_override(cfg, ["AZURE_OPENAI_API_KEY"])
        ):
            errs.append("Azure OpenAI connector requires AZURE_OPENAI_API_KEY")

    # GCP requirements
    if "gcp" in (cfg.memory_providers or []):
        if not (
            _has_any(["GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_APPLICATION_CREDENTIALS_JSON"])
            or _has_override(cfg, ["GOOGLE_APPLICATION_CREDENTIALS"])
        ):
            errs.append(
                "GCP memory provider requires GOOGLE_APPLICATION_CREDENTIALS or equivalent secret override"
            )
        if not _has_any(["GOOGLE_CLOUD_PROJECT", "GCP_PROJECT"]):
            errs.append("GCP memory provider requires GOOGLE_CLOUD_PROJECT or GCP_PROJECT")
    if env.get("GOOGLE_CLOUD_PROJECT") or _has_override(cfg, ["GOOGLE_PROJECT", "GOOGLE_CLOUD_PROJECT"]):
        if not (
            _has_any(["GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_APPLICATION_CREDENTIALS_JSON"])
            or _has_override(cfg, ["GOOGLE_APPLICATION_CREDENTIALS"])
        ):
            errs.append(
                "Google Cloud connectors require GOOGLE_APPLICATION_CREDENTIALS or inline credentials"
            )

    return errs


def _base_dir() -> Path:
    env = os.getenv("NEXUS_CONFIG_DIR")
    if env:
        return Path(env)
    try:
        if "__file__" in globals():
            return Path(__file__).resolve().parent
    except Exception as exc:
        log.debug("config_base_dir_resolution_failed", extra={"error": str(exc)})
    return Path.cwd()


def _coerce_bool(key: str, value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)) and value in {0, 1}:
        return bool(value)
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in _BOOL_TRUE:
            return True
        if normalized in _BOOL_FALSE:
            return False
    raise ConfigError(f"Environment override for '{key}' must be a boolean value")


def _coerce_int(key: str, value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ConfigError(f"Environment override for '{key}' must be an integer") from exc


def _coerce_float(key: str, value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ConfigError(f"Environment override for '{key}' must be a float") from exc


def _coerce_list(key: str, value: Any) -> List[str]:
    sequence: Iterable[Any]
    if value is None:
        return []
    if isinstance(value, list):
        sequence = value
    elif isinstance(value, str):
        raw = value.strip()
        if not raw:
            return []
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            sequence = [part.strip() for part in raw.split(",")]
        else:
            if isinstance(parsed, list):
                sequence = parsed
            else:
                sequence = [parsed]
    else:
        raise ConfigError(f"Environment override for '{key}' must be a list")

    result: List[str] = []
    seen: set[str] = set()
    for item in sequence:
        if not isinstance(item, str):
            raise ConfigError(f"Environment override for '{key}' must be a list of strings")
        cleaned = item.strip()
        if cleaned:
            normalized = cleaned.lower()
            if normalized not in seen:
                seen.add(normalized)
                result.append(normalized)
    return result


def _coerce_mapping(key: str, value: Any) -> Dict[str, str]:
    if value is None:
        return {}
    if isinstance(value, dict):
        items = value.items()
    elif isinstance(value, str):
        raw = value.strip()
        if not raw:
            return {}
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ConfigError(f"Environment override for '{key}' must be a JSON object") from exc
        if not isinstance(parsed, dict):
            raise ConfigError(f"Environment override for '{key}' must deserialize to a JSON object")
        items = parsed.items()
    else:
        raise ConfigError(f"Environment override for '{key}' must be a mapping")

    return {str(k): str(v) for k, v in items}


def _read_json(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    try:
        payload = json.loads(path.read_text("utf-8"))
    except json.JSONDecodeError as exc:
        raise ConfigError(f"Configuration file '{path}' contains invalid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ConfigError(f"Configuration file '{path}' must contain a JSON object")
    config_node = payload.get("config", payload)
    if not isinstance(config_node, dict):
        raise ConfigError(f"Configuration file '{path}' must define an object under 'config'")
    return config_node


def load_config(
    paths: Optional[List[str]] = None,
    env_prefix: str = "NEXUS_",
    include_defaults: bool = True,
) -> NexusConfig:
    data: Dict[str, Any] = {}
    seen: set[Path] = set()

    if include_defaults:
        default_path = _base_dir() / "nexus_config.json"
        if default_path.exists():
            seen.add(default_path.resolve())
            data.update(_read_json(default_path))

    for raw_path in paths or []:
        path = Path(raw_path)
        resolved = path.resolve()
        if resolved in seen:
            continue
        data.update(_read_json(path))
        seen.add(resolved)

    def gv(key: str, default: Any) -> Any:
        node: Any = data
        for part in key.split("."):
            if isinstance(node, dict) and part in node:
                node = node[part]
            else:
                node = None
                break
        return default if node is None else node

    def ge(key: str, default: Any) -> Any:
        env_key = env_prefix + key.replace(".", "_").upper()
        if env_key in os.environ:
            return os.environ[env_key]
        return gv(key, default)

    return NexusConfig(
        engine_mode=str(ge("engine_mode", "mixed")).strip().lower(),
        routing_policy=str(ge("routing_policy", "reliability_weighted")).strip().lower(),
        secret_providers=_coerce_list("secret_providers", ge("secret_providers", ["aws"])),
        secret_overrides=_coerce_mapping("secret_overrides", ge("secret_overrides", {})),
        secret_ttl_seconds=_coerce_int("secret_ttl_seconds", ge("secret_ttl_seconds", 600)),
        memory_providers=_coerce_list("memory_providers", ge("memory_providers", ["memory"])),
        memory_fanout_writes=_coerce_bool("memory_fanout_writes", ge("memory_fanout_writes", True)),
        require_any_connector=_coerce_bool(
            "require_any_connector", ge("require_any_connector", False)
        ),
        max_context_messages=_coerce_int("max_context_messages", ge("max_context_messages", 12)),
        alpha_semantic=_coerce_float("alpha_semantic", ge("alpha_semantic", 0.7)),
        encrypt=_coerce_bool("encrypt", ge("encrypt", True)),
    )


def validate_config(cfg: NexusConfig) -> List[str]:
    errs: List[str] = []
    if cfg.engine_mode not in {"delegates", "direct", "mixed"}:
        errs.append("engine_mode must be delegates|direct|mixed")
    if cfg.routing_policy not in {"reliability_weighted", "round_robin", "first_good"}:
        errs.append("routing_policy invalid")
    if not cfg.secret_providers:
        errs.append("secret_providers must not be empty")
    for p in cfg.secret_providers:
        if p not in {"aws", "azure", "gcp"}:
            errs.append(f"unknown secret provider: {p}")
    for m in cfg.memory_providers:
        if m not in {"aws", "azure", "gcp", "memory"}:
            errs.append(f"unknown memory provider: {m}")
    if not (0.0 <= cfg.alpha_semantic <= 1.0):
        errs.append("alpha_semantic must be in [0,1]")
    if cfg.max_context_messages < 1:
        errs.append("max_context_messages must be >= 1")
    hints = {
        "has_delegate": any(k.endswith("_DELEGATE") for k in cfg.secret_overrides),
        "has_endpoint": any(k.endswith("_ENDPOINT") for k in cfg.secret_overrides),
        "has_keys": any(k.endswith("_API_KEY") for k in cfg.secret_overrides),
        "bedrock": any(k in {"BEDROCK_MODEL_ID"} for k in cfg.secret_overrides),
        "vertex": any(
            k in {"GOOGLE_PROJECT", "VERTEX_LOCATION", "VERTEX_MODEL_ID"}
            for k in cfg.secret_overrides
        ),
        "azure_openai": any(
            k
            in {"AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_DEPLOYMENT", "AZURE_OPENAI_API_KEY"}
            for k in cfg.secret_overrides
        ),
        "azure_foundry": any(
            k in {"AZURE_INFERENCE_ENDPOINT", "AZURE_INFERENCE_API_KEY"}
            for k in cfg.secret_overrides
        ),
    }
    has_cloud_llm = any(
        (
            hints["bedrock"],
            hints["vertex"],
            hints["azure_openai"],
            hints["azure_foundry"],
        )
    )
    if cfg.require_any_connector and not (
        hints["has_delegate"]
        or (hints["has_endpoint"] and hints["has_keys"])
        or has_cloud_llm
    ):
        errs.append(
            "no connectors configured; add *_DELEGATE or *_ENDPOINT+*_API_KEY or one of: "
            "BEDROCK_MODEL_ID | (GOOGLE_PROJECT+VERTEX_LOCATION+VERTEX_MODEL_ID) | "
            "(AZURE_OPENAI_ENDPOINT+AZURE_OPENAI_DEPLOYMENT+AZURE_OPENAI_API_KEY) | "
            "(AZURE_INFERENCE_ENDPOINT+AZURE_INFERENCE_API_KEY)"
        )
    errs.extend(_validate_cloud_credentials(cfg))
    return errs


def save_config(cfg: NexusConfig, path: Optional[str] = None) -> str:
    out = Path(path or (_base_dir() / "nexus_config.json"))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"config": asdict(cfg)}, indent=2), encoding="utf-8")
    return str(out)


def load_and_validate(
    paths: Optional[List[str]] = None, env_prefix: str = "NEXUS_"
) -> Tuple[NexusConfig, List[str]]:
    cfg = load_config(paths, env_prefix)
    return cfg, validate_config(cfg)


class SecretResolver:
    """Resolve secrets across environment overrides and provider backends."""

    def __init__(
        self,
        providers: Iterable[str] | None = None,
        overrides: Optional[Dict[str, Any]] = None,
        ttl_seconds: int = 600,
    ) -> None:
        normalized: List[str] = []
        seen: set[str] = set()
        for provider in providers or []:
            if not isinstance(provider, str):
                continue
            cleaned = provider.strip().lower()
            if cleaned and cleaned not in seen:
                seen.add(cleaned)
                normalized.append(cleaned)
        if not normalized:
            normalized = ["aws"]

        ttl = _coerce_int("ttl_seconds", ttl_seconds)
        if ttl <= 0:
            raise ConfigError("ttl_seconds must be a positive integer")

        self.providers = normalized
        self.ttl_seconds = ttl
        self._overrides: Dict[str, Any] = {
            str(k): v for k, v in (overrides or {}).items() if v is not None
        }
        self._cache: Dict[str, Tuple[float, Any]] = {}

    def _normalize(self, key: str) -> str:
        cleaned = str(key or "").strip()
        if not cleaned:
            raise ConfigError("Secret keys must be non-empty strings")
        return cleaned.upper()

    def _store(self, key: str, value: Any) -> Any:
        expires = time.time() + float(self.ttl_seconds)
        self._cache[key] = (expires, value)
        return value

    def get(self, key: str, default: Any = None) -> Any:
        normalized = self._normalize(key)
        cached = self._cache.get(normalized)
        now = time.time()
        if cached and cached[0] > now:
            return cached[1]

        direct_candidates = (
            normalized,
            f"NEXUS_SECRET_{normalized}",
            key,
        )
        for candidate in direct_candidates:
            if candidate in self._overrides:
                return self._store(normalized, self._overrides[candidate])

        env_value = os.getenv(f"NEXUS_SECRET_{normalized}")
        if env_value is not None:
            return self._store(normalized, env_value)

        return default
