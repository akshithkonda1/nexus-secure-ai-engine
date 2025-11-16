# flask_app.py
from __future__ import annotations


import asyncio
import atexit
import contextvars
import hmac
import json
import logging
import os
import socket
import threading
import time
import traceback
import uuid
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime as dt, timezone
from functools import wraps
from queue import Queue
from typing import Any, Optional
from urllib.parse import urlparse

try:
    from api.bootstrap_alpha import wire_alpha
except ModuleNotFoundError:  # pragma: no cover - test harness path
    import importlib.util
    from pathlib import Path

    _bootstrap_path = Path(__file__).resolve().parents[2] / "api" / "bootstrap_alpha.py"
    spec = importlib.util.spec_from_file_location("api.bootstrap_alpha", _bootstrap_path)
    module = importlib.util.module_from_spec(spec)
    if spec and spec.loader:
        spec.loader.exec_module(module)
        wire_alpha = module.wire_alpha  # type: ignore[attr-defined]
    else:  # pragma: no cover - defensive
        raise
from .bootstrap import BootstrapError, _build_resolver, make_connectors
from flask import Flask, Response, g, has_request_context, jsonify, request, stream_with_context
from .memory_compute import (
    AzureBlobMemoryStore,
    DynamoDBMemoryStore,
    FirestoreMemoryStore,
    InMemoryStore,
    MemoryStoreError,
    MultiMemoryStore,
    health_suite,
)
from .nexus_config import ConfigError, NexusConfig, load_and_validate
from .nexus_engine import (
    AccessContext,
    Crypter,
    DeadlineExceeded,
    Engine,
    EngineConfig,
    MAX_MODELS_PER_REQUEST,
    MisconfigurationError,
    SearchProvider,
    WebRetriever,
    build_connectors_cloud_first,
    build_web_retriever_from_env,
    MAX_MODELS_PER_REQUEST,
)
from werkzeug.middleware.proxy_fix import ProxyFix

from nexus.audit_logger import Actor, log_event
from nexus.plan_resolver import UserTierContext, get_effective_tier
from nexus.qos import enforce_qos
from nexus.security import redact_and_detect
from .migrations import AUDIT_LOG_SCHEMA_VERSION, ensure_audit_table_exists


MAX_PROMPT_LENGTH = 32_000
MAX_DEADLINE_MS = 60_000

_startup_logger = logging.getLogger("nexus.flask.startup")
if not _startup_logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(
        logging.Formatter('{"ts":"%(asctime)s","lvl":"%(levelname)s","msg":"%(message)s"}')
    )
    _startup_logger.addHandler(_handler)
_startup_logger.setLevel(logging.INFO)


def node_health():
    return {
        "pid": os.getpid(),
        "host": socket.gethostname(),
        "time": int(time.time()),
    }


def _allow_test_fallbacks() -> bool:
    return os.getenv("NEXUS_ALLOW_TEST_FALLBACKS", "0").lower() in {"1", "true", "yes", "y", "on"}


def _coerce_bool(value, *, default: bool) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() not in {"", "0", "false", "no", "off"}
    return bool(value)


class AppInitializationError(RuntimeError):
    """Raised when the Flask gateway cannot start with the current environment."""


@dataclass(frozen=True)
class GatewaySettings:
    api_keys: tuple[str, ...]
    trusted_origins: tuple[str, ...]
    request_max_bytes: int
    enforce_https: bool
    rate_limits: tuple[str, ...]
    rate_limit_storage_url: str


_BOOL_TRUE = {"1", "true", "yes", "y", "on"}
_BOOL_FALSE = {"0", "false", "no", "n", "off"}


def _dedupe(seq: Iterable[str]) -> tuple[str, ...]:
    seen = set()
    ordered: list[str] = []
    for item in seq:
        if item not in seen:
            seen.add(item)
            ordered.append(item)
    return tuple(ordered)


def _csv_env(name: str, *, required: bool) -> tuple[str, ...]:
    raw = os.getenv(name, "")
    if not raw:
        if required:
            raise AppInitializationError(f"Environment variable '{name}' must be set")
        return tuple()
    parts = [part.strip() for part in raw.replace("\n", ",").split(",") if part.strip()]
    values = _dedupe(parts)
    if required and not values:
        raise AppInitializationError(
            f"Environment variable '{name}' must contain at least one value"
        )
    return values


def _bool_env(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    normalized = raw.strip().lower()
    if normalized in _BOOL_TRUE:
        return True
    if normalized in _BOOL_FALSE:
        return False
    raise AppInitializationError(f"Environment variable '{name}' must be a boolean value")


def _int_env(name: str, default: int, *, minimum: int = 1) -> int:
    raw = os.getenv(name)
    value_str = str(default) if raw is None else raw.strip()
    if not value_str:
        raise AppInitializationError(f"Environment variable '{name}' cannot be empty")
    try:
        value = int(value_str)
    except ValueError as exc:
        raise AppInitializationError(f"Environment variable '{name}' must be an integer") from exc
    if value < minimum:
        raise AppInitializationError(f"Environment variable '{name}' must be >= {minimum}")
    return value


def _parse_user_datetime(value: str | None) -> dt | None:
    if not value:
        return None
    try:
        normalized = value.strip()
        if not normalized:
            return None
        if normalized.endswith("Z"):
            normalized = normalized[:-1] + "+00:00"
        parsed = dt.fromisoformat(normalized)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def _user_from_headers() -> UserTierContext:
    user_id = (
        request.headers.get("X-User-ID") or request.headers.get("X-API-Key") or "anonymous"
    ).strip() or "anonymous"
    billing_tier = (
        request.headers.get("X-Billing-Tier") or request.headers.get("X-User-Tier") or ""
    ).strip() or None
    verified_until = _parse_user_datetime(request.headers.get("X-Student-Verified-Until"))
    grace_until = _parse_user_datetime(request.headers.get("X-Student-Grace-Until"))
    return UserTierContext(
        id=user_id,
        billing_tier=billing_tier,
        student_verified_until=verified_until,
        student_grace_until=grace_until,
    )


def _current_user() -> UserTierContext:
    user = getattr(g, "current_user", None)
    if user is None:
        user = _user_from_headers()
        g.current_user = user
    return user


def _current_actor() -> Actor:
    user = _current_user()
    return Actor(user_id=user.id, tier=get_effective_tier(user))


def _load_gateway_settings() -> GatewaySettings:
    api_keys = _csv_env("AUTHORIZED_API_KEYS", required=True)
    origins = _csv_env("TRUSTED_ORIGINS", required=True)
    for origin in origins:
        parsed = urlparse(origin)
        if parsed.scheme != "https" or not parsed.netloc:
            raise AppInitializationError("TRUSTED_ORIGINS must list valid https:// origins")
    max_bytes = _int_env("NEXUS_MAX_REQUEST_BYTES", 2 * 1024 * 1024, minimum=1024)
    enforce_https = _bool_env("NEXUS_ENFORCE_HTTPS", True)
    rate_limits = _csv_env("NEXUS_RATE_LIMITS", required=False) or (
        "200/day",
        "50/hour",
    )
    storage_url = os.getenv("NEXUS_RATE_LIMIT_STORAGE_URL", "memory://").strip() or "memory://"
    env = os.getenv("NEXUS_ENV", "").lower()
    if env in {"prod", "production"} and storage_url == "memory://":
        raise AppInitializationError(
            "NEXUS_RATE_LIMIT_STORAGE_URL must be configured with a persistent backend in production",
        )
    return GatewaySettings(
        api_keys=api_keys,
        trusted_origins=origins,
        request_max_bytes=max_bytes,
        enforce_https=enforce_https,
        rate_limits=tuple(rate_limits),
        rate_limit_storage_url=storage_url,
    )


def _load_nexus_config() -> NexusConfig:
    paths = list(_csv_env("NEXUS_CONFIG_PATHS", required=False)) or None
    try:
        cfg, errors = load_and_validate(paths=paths)
    except ConfigError as exc:
        raise AppInitializationError(f"Unable to load Nexus configuration: {exc}") from exc
    if errors:
        for err in errors:
            _startup_logger.error("config_validation_error error=%s", err)
        raise AppInitializationError("Configuration validation failed; see logs for details")
    return cfg


# Optional deps
try:
    from flask_cors import CORS
except Exception as exc:  # pragma: no cover - depends on deployment extras
    if not _allow_test_fallbacks():
        raise AppInitializationError("flask-cors is required for production deployments") from exc
    CORS = None
try:
    from flask_talisman import Talisman
except Exception as exc:  # pragma: no cover - depends on deployment extras
    if not _allow_test_fallbacks():
        raise AppInitializationError(
            "flask-talisman is required for production deployments"
        ) from exc
    Talisman = None
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
except Exception as exc:  # pragma: no cover - depends on deployment extras
    if not _allow_test_fallbacks():
        raise AppInitializationError(
            "flask-limiter is required for production deployments"
        ) from exc
    Limiter = None

    def get_remote_address():  # type: ignore
        return request.remote_addr  # type: ignore[attr-defined]


try:
    from bleach import clean as bleach_clean
except Exception as exc:  # pragma: no cover - depends on deployment extras
    if not _allow_test_fallbacks():
        raise AppInitializationError("bleach is required for input sanitisation") from exc

    def bleach_clean(x):  # type: ignore
        return x


# -----------------------------------------------------------------------------
# App & logging
# -----------------------------------------------------------------------------
GATEWAY_SETTINGS = _load_gateway_settings()
AUTHORIZED_API_KEYS = set(GATEWAY_SETTINGS.api_keys)
TRUSTED_ORIGINS = set(GATEWAY_SETTINGS.trusted_origins)
MAX_REQUEST_BYTES = GATEWAY_SETTINGS.request_max_bytes
ENFORCE_HTTPS = GATEWAY_SETTINGS.enforce_https

CORE_CONFIG = _load_nexus_config()


def build_memory(cfg: NexusConfig) -> MultiMemoryStore:
    providers = cfg.memory_providers or ["memory"]
    stores = []
    for provider in providers:
        normalized = provider.lower()
        try:
            if normalized == "aws":
                table = os.getenv("NEXUS_DDB_MESSAGES", "nexus_messages").strip()
                index = os.getenv("NEXUS_DDB_INDEX", "nexus_memindex").strip()
                region = os.getenv("AWS_REGION", "us-east-1").strip() or "us-east-1"
                if not table:
                    raise AppInitializationError(
                        "NEXUS_DDB_MESSAGES cannot be empty for AWS memory provider"
                    )
                stores.append(
                    DynamoDBMemoryStore(
                        table,
                        index or None,
                        region,
                    ),
                )
            elif normalized == "gcp":
                prefix = os.getenv("NEXUS_FS_PREFIX", "nexus").strip() or "nexus"
                stores.append(FirestoreMemoryStore(prefix))
            elif normalized == "azure":
                container = (
                    os.getenv("NEXUS_AZ_CONTAINER", "nexus-messages").strip() or "nexus-messages"
                )
                prefix = os.getenv("NEXUS_AZ_PREFIX", "nexus").strip() or "nexus"
                connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
                if not connection_string or not connection_string.strip():
                    raise AppInitializationError(
                        "AZURE_STORAGE_CONNECTION_STRING is required for Azure memory provider",
                    )
                stores.append(
                    AzureBlobMemoryStore(
                        container=container,
                        prefix=prefix,
                        connection_string=connection_string,
                    ),
                )
            else:
                stores.append(InMemoryStore())
        except (ImportError, MemoryStoreError, RuntimeError) as exc:
            raise AppInitializationError(
                f"Failed to initialise memory provider '{provider}': {exc}",
            ) from exc
    if not stores:
        stores.append(InMemoryStore())
    return MultiMemoryStore(stores, fanout_writes=cfg.memory_fanout_writes)


def _build_access_context() -> AccessContext:
    tenant = (os.getenv("NEXUS_TENANT_ID") or "").strip()
    instance = (os.getenv("NEXUS_INSTANCE_ID") or "").strip()
    user = (os.getenv("NEXUS_DEFAULT_USER_ID") or "__gateway__").strip() or "__gateway__"
    if not tenant:
        raise AppInitializationError("NEXUS_TENANT_ID must be configured")
    if not instance:
        raise AppInitializationError("NEXUS_INSTANCE_ID must be configured")
    return AccessContext(tenant, instance, user)


memory = build_memory(CORE_CONFIG)

try:
    secret_resolver = _build_resolver(CORE_CONFIG)
except Exception as exc:
    raise AppInitializationError(f"Unable to initialise secret resolver: {exc}") from exc

try:
    connectors = build_connectors_cloud_first(resolver=secret_resolver)
except MisconfigurationError as exc:
    logging.getLogger(__name__).warning(
        "cloud_first_connectors_unavailable",
        extra={"error": str(exc)},
    )
    try:
        connectors = make_connectors(CORE_CONFIG)
    except BootstrapError as bootstrap_exc:
        raise AppInitializationError(
            f"Unable to build model connectors: {bootstrap_exc}"
        ) from bootstrap_exc
except Exception as exc:
    raise AppInitializationError(f"Unable to build model connectors: {exc}") from exc

if not CORE_CONFIG.encrypt:
    raise AppInitializationError(
        "Encryption is mandatory for Nexus deployments; set encrypt=true in configuration"
    )

try:
    crypter = Crypter.from_resolver(secret_resolver)
except Exception as exc:
    raise AppInitializationError(f"Unable to initialise crypter: {exc}") from exc

web_retriever = build_web_retriever_from_env(resolver=secret_resolver)
if web_retriever is None:
    if _allow_test_fallbacks():

        class _StubProvider(SearchProvider):
            name = "stub"

            def search(
                self,
                query: str,
                *,
                k: int = 5,
                images: bool = False,
                deadline: float | None = None,
            ) -> list[Any]:  # type: ignore[override]
                return []

        web_retriever = WebRetriever([_StubProvider()])
    else:
        raise AppInitializationError(
            "No search providers configured. Set SEARCH_GATEWAY_* secrets or enable third-party search providers.",
        )

access_context = _build_access_context()

engine_config = EngineConfig(max_context_messages=CORE_CONFIG.max_context_messages)

engine = Engine(
    connectors=connectors,
    memory=memory,
    web=web_retriever,
    access=access_context,
    crypter=crypter,
    config=engine_config,
)

_request_id_ctx: contextvars.ContextVar[str] = contextvars.ContextVar(
    "nexus_request_id", default="-"
)

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

logger = logging.getLogger("nexus.flask")
if not logger.handlers:
    h = logging.StreamHandler()

    class _RequestContextFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:  # pragma: no cover - logging
            record.request_id = _request_id_ctx.get("-")
            record.http_path = getattr(record, "http_path", "-")
            record.http_method = getattr(record, "http_method", "-")
            if has_request_context():
                try:
                    record.http_path = request.path
                    record.http_method = request.method
                except RuntimeError:
                    record.http_path = record.http_path or "-"
                    record.http_method = record.http_method or "-"
            return True

    h.addFilter(_RequestContextFilter())
    h.setFormatter(
        logging.Formatter(
            '{"ts":"%(asctime)s","lvl":"%(levelname)s","request_id":"%(request_id)s"'
            ',"method":"%(http_method)s","path":"%(http_path)s","msg":"%(message)s"}'
        )
    )
    logger.addHandler(h)
logger.setLevel(logging.INFO)

start_time = dt.utcnow()

app.config.update(
    {
        "NEXUS_GATEWAY_SETTINGS": GATEWAY_SETTINGS,
        "NEXUS_CORE_CONFIG": CORE_CONFIG,
        "NEXUS_ENGINE": engine,
        "NEXUS_CONNECTORS": connectors,
        "NEXUS_MEMORY": memory,
        "NEXUS_SECRET_RESOLVER": secret_resolver,
        "NEXUS_CRYPTER": crypter,
        "NEXUS_WEB_RETRIEVER": web_retriever,
        "NEXUS_ACCESS_CONTEXT": access_context,
        "NEXUS_START_TIME": start_time,
        "ALPHA_ACCESS_TOKEN": (os.getenv("ALPHA_ACCESS_TOKEN") or "").strip(),
    },
)

if Talisman:
    Talisman(
        app,
        content_security_policy={"default-src": ["'self'"]},
        force_https=ENFORCE_HTTPS,
        force_https_permanent=False,
        strict_transport_security=ENFORCE_HTTPS,
        permissions_policy={
            "geolocation": "()",
            "microphone": "()",
            "camera": "()",
            "browsing-topics": "()",
        },
    )
if CORS:
    CORS(
        app,
        origins=list(TRUSTED_ORIGINS),
        allow_headers=["Content-Type", "X-API-Key"],
        methods=["GET", "POST", "OPTIONS"],
    )

if Limiter:
    limiter = Limiter(
        key_func=lambda: request.headers.get("X-API-Key") or get_remote_address(),
        default_limits=list(GATEWAY_SETTINGS.rate_limits),
        storage_uri=GATEWAY_SETTINGS.rate_limit_storage_url,
        strategy=os.getenv("NEXUS_RATE_LIMIT_STRATEGY", "fixed-window"),
    )
    limiter.init_app(app)
else:

    class _NoLimit:
        def limit(self, *_a, **_k):
            def _wrap(f):
                return f

            return _wrap

        def init_app(self, *_a, **_k):  # pragma: no cover - no-op for tests
            return self

    limiter = _NoLimit()


def _ct_eq(a: str, b: str) -> bool:
    try:
        return hmac.compare_digest(a, b)
    except Exception:
        return a == b


def _valid_api_key(k: str) -> bool:
    return any(_ct_eq(k, real) for real in AUTHORIZED_API_KEYS)


def require_api_key(f):
    @wraps(f)
    def _wrap(*args, **kwargs):
        provided_key = request.headers.get("X-API-Key", "")
        if not _valid_api_key(provided_key):
            log_event(
                "auth.unauthorized",
                Actor(user_id=provided_key or "anonymous"),
                {"path": request.path, "method": request.method},
            )
            return jsonify({"error": "Unauthorized"}), 401
        g.current_user = _user_from_headers()
        log_event(
            "auth.authorized",
            _current_actor(),
            {"path": request.path, "method": request.method},
        )
        return f(*args, **kwargs)

    return _wrap


@app.before_request
def _assign_request_id():
    header_rid = (request.headers.get("X-Request-ID") or "").strip()
    rid = header_rid or uuid.uuid4().hex
    g.request_id = rid
    token = _request_id_ctx.set(rid)
    g._request_id_token = token


@app.before_request
def _log_request_start():
    user = _user_from_headers()
    g.current_user = user
    log_event(
        "request.start",
        Actor(user_id=user.id, tier=get_effective_tier(user)),
        {
            "path": request.path,
            "method": request.method,
            "request_id": getattr(g, "request_id", ""),
        },
    )


@app.after_request
def _inject_request_id(response: Response):
    rid = getattr(g, "request_id", None)
    if rid:
        response.headers.setdefault("X-Request-ID", rid)
    user = getattr(g, "current_user", None)
    actor = (
        Actor(user_id=user.id, tier=get_effective_tier(user))
        if user
        else Actor(user_id="anonymous")
    )
    log_event(
        "request.end",
        actor,
        {
            "path": request.path,
            "method": request.method,
            "status": response.status_code,
            "request_id": rid,
        },
    )
    return response


@app.teardown_request
def _reset_request_id(_exc):
    token = getattr(g, "_request_id_token", None)
    if token:
        try:
            _request_id_ctx.reset(token)
        except ValueError:  # pragma: no cover - defensive
            _request_id_ctx.set("-")
    else:
        _request_id_ctx.set("-")


@app.before_request
def enforce_https_and_size():
    if (
        ENFORCE_HTTPS
        and not app.debug
        and request.headers.get("X-Forwarded-Proto", "https").lower() != "https"
    ):
        return jsonify({"error": "HTTPS required"}), 403
    if request.content_length and request.content_length > MAX_REQUEST_BYTES:
        return jsonify({"error": "Request too large"}), 413


@app.errorhandler(Exception)
def global_error(e):
    logger.error("Unhandled: %s", traceback.format_exc())
    return jsonify({"error": "Internal server error"}), 500


def _readiness_report() -> tuple[bool, dict[str, Any]]:
    ready = True
    detail: dict[str, Any] = {"connectors": {}, "memory": {}, "web": {}}
    for name, conn in connectors.items():
        try:
            degraded = bool(conn.health_check()) if hasattr(conn, "health_check") else False
            detail["connectors"][name] = "degraded" if degraded else "ok"
            if degraded:
                ready = False
        except Exception as exc:  # pragma: no cover - exercised via unit tests
            detail["connectors"][name] = f"error: {exc}"
            ready = False
    try:
        detail["memory"] = health_suite(memory)
    except Exception as exc:  # pragma: no cover - defensive
        detail["memory_error"] = str(exc)
        ready = False
    providers = []
    if getattr(web_retriever, "providers", None):
        for provider in web_retriever.providers:
            providers.append(getattr(provider, "name", provider.__class__.__name__))
    detail["web"]["providers"] = providers
    return ready, detail


def sanitize_input(data):
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    if isinstance(data, list):
        return [sanitize_input(v) for v in data]
    if isinstance(data, str):
        return bleach_clean(data)
    return data


def _uptime() -> str:
    origin = app.config.get("NEXUS_START_TIME", start_time)
    return str(dt.utcnow() - origin).split(".")[0]


# Optional DynamoDB resources for audit/scope/webhooks
ClientError = BotoCoreError = Exception  # type: ignore
try:
    import boto3
    from boto3.dynamodb.conditions import Key
    from botocore.exceptions import BotoCoreError, ClientError  # type: ignore

    ddb = boto3.resource("dynamodb", region_name=os.getenv("AWS_REGION", "us-east-1"))
    audit_table_name = os.getenv("DYNAMODB_AUDIT_TABLE", "NexusAuditLogs")
    try:
        ensure_audit_table_exists(ddb, table_name=audit_table_name)
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning(
            "audit_table_initialization_failed",
            exc_info=True,
            extra={"error": str(exc)},
        )
        raise
    audit_table = ddb.Table(audit_table_name)
    scope_table = ddb.Table(os.getenv("DYNAMODB_SCOPE_TABLE", "NexusUserScopes"))
    webhook_table = ddb.Table(os.getenv("DYNAMODB_WEBHOOK_TABLE", "NexusWebhooks"))
except (ClientError, BotoCoreError) as exc:
    logger.warning(
        "dynamodb_initialization_failed",
        exc_info=True,
        extra={"error": str(exc)},
    )
    boto3 = None
    Key = None
    audit_table = scope_table = webhook_table = None
except Exception:
    boto3 = None
    Key = None
    audit_table = scope_table = webhook_table = None


def _audit_put(item: dict[str, Any]) -> None:
    if audit_table:
        try:
            payload = dict(item)
            payload.setdefault("schema_version", AUDIT_LOG_SCHEMA_VERSION)
            audit_table.put_item(Item=payload)
        except Exception as e:
            logger.warning(
                "audit_put_failed",
                exc_info=True,
                extra={"error": str(e)},
            )


def _scope_put(user_id: str, scope: str) -> bool:
    if scope_table:
        try:
            scope_table.put_item(
                Item={"user_id": user_id, "scope": scope, "updated_at": dt.utcnow().isoformat()}
            )
            return True
        except Exception as e:
            logger.warning(f"scope put failed: {e}")
    return False


def _scope_get(user_id: str):
    if scope_table:
        try:
            r = scope_table.get_item(Key={"user_id": user_id})
            return r.get("Item", {}).get("scope")
        except Exception as e:
            logger.warning(f"scope get failed: {e}")
    return None


def _webhook_list() -> list:
    if webhook_table:
        try:
            return webhook_table.scan(Limit=100).get("Items", [])
        except Exception as e:
            logger.warning(f"webhook scan failed: {e}")
    return []


def _webhook_store(url: str, event_type: str) -> bool:
    if webhook_table:
        try:
            u = urlparse(url)
            if u.scheme != "https" or not u.netloc:
                return False
            webhook_table.put_item(
                Item={
                    "url": url,
                    "event": event_type,
                    "created_at": dt.utcnow().isoformat(),
                    "ttl": int(time.time()) + 60 * 60 * 24 * 30,
                }
            )
            return True
        except Exception as e:
            logger.warning(f"webhook put failed: {e}")
    return False


# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------
@app.route("/", methods=["GET"])
@require_api_key
def home():
    return (
        jsonify(
            {
                "message": "✅ Nexus AI is secure and online",
                "version": os.getenv("APP_VERSION", "1.0.0"),
                "uptime": _uptime(),
                "routes": [
                    "/debate",
                    "/backup",
                    "/status",
                    "/log",
                    "/auth/scope",
                    "/webhooks/register",
                    "/webhooks/list",
                    "/audit",
                    "/auth/scope/<user_id>",
                ],
            }
        ),
        200,
    )


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "uptime": _uptime()}), 200


@app.route("/healthz", methods=["GET"])
def healthz():
    return jsonify({"status": "ok", "uptime": _uptime()}), 200


@app.route("/readyz", methods=["GET"])
def readyz():
    ready, detail = _readiness_report()
    status = 200 if ready else 503
    payload = {"status": "ok" if ready else "error", "uptime": _uptime()}
    if not ready:
        payload["detail"] = detail
    return jsonify(payload), status


def _sse(event: dict) -> str:
    """Format a dict as a single Server-Sent Event."""
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


@app.route("/debate/stream", methods=["POST"])
@require_api_key
@limiter.limit("20 per minute")
@enforce_qos(lambda *_args, **_kwargs: _current_user())
def debate_stream():
    """
    Streaming debate endpoint using Server-Sent Events.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415

    data = sanitize_input(request.get_json() or {})
    prompt = (data.get("prompt") or "").strip()
    requested_models = data.get("models", [])
    pii_protection = _coerce_bool(data.get("pii_protection"), default=True)
    pii_override = _coerce_bool(data.get("pii_override"), default=False)
    raw_deadline = data.get("deadline_ms")
    deadline_ms: Optional[int] = None
    if raw_deadline is not None:
        try:
            deadline_ms = int(raw_deadline)
        except (TypeError, ValueError):
            return jsonify({"error": "deadline_ms must be an integer"}), 400
        if deadline_ms <= 0:
            deadline_ms = None
        else:
            deadline_ms = min(deadline_ms, MAX_DEADLINE_MS)

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 415

    session_id = request.headers.get("X-API-Key", "anonymous")
    user_ctx = _current_user()

    queue: "Queue[Optional[str]]" = Queue()

    @stream_with_context
    def generate():
        start_event = {
            "type": "start",
            "status": "processing",
            "timestamp": dt.utcnow().isoformat() + "Z",
        }
        yield _sse(start_event)

        while True:
            chunk = queue.get()
            if chunk is None:
                break
            yield chunk

    async def stream_callback(event_type: str, payload: dict):
        event = {
            "type": event_type,
            "timestamp": dt.utcnow().isoformat() + "Z",
            **(payload or {}),
        }
        try:
            queue.put(_sse(event))
        except Exception as exc:
            logger.debug(
                "stream_callback_failed",
                extra={"error": str(exc), "event_type": event_type},
            )

    def run_engine():
        loop = asyncio.new_event_loop()
        try:
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                engine.run_async_streaming(
                    session_id=session_id,
                    query=prompt,
                    requested_models=requested_models,
                    user=user_ctx,
                    pii_protection=pii_protection,
                    pii_override=pii_override,
                    deadline_ms=deadline_ms,
                    stream_callback=stream_callback,
                )
            )
            complete_event = {
                "type": "complete",
                "timestamp": dt.utcnow().isoformat() + "Z",
                "result": result,
            }
            queue.put(_sse(complete_event))
        except Exception as exc:
            logger.error("Streaming error: %s", traceback.format_exc())
            error_event = {
                "type": "error",
                "timestamp": dt.utcnow().isoformat() + "Z",
                "message": str(exc),
            }
            queue.put(_sse(error_event))
        finally:
            queue.put(None)
            try:
                loop.close()
            except Exception:
                pass

    threading.Thread(target=run_engine, daemon=True).start()

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.route("/status", methods=["GET"])
@require_api_key
@limiter.limit("30 per minute")
def status():
    model_report = {}
    for name, conn in connectors.items():
        try:
            degraded = bool(conn.health_check()) if hasattr(conn, "health_check") else False
            model_report[name] = "Degraded" if degraded else "Healthy"
        except Exception as e:
            model_report[name] = f"Error: {e}"
    return (
        jsonify(
            {
                "status": "🟢 Running",
                "version": os.getenv("APP_VERSION", "1.0.0"),
                "uptime": _uptime(),
                "models": model_report,
                "memory": health_suite(memory),
            }
        ),
        200,
    )


@app.route("/debate", methods=["POST"])
@require_api_key
@limiter.limit("20 per minute")
@enforce_qos(lambda *_args, **_kwargs: _current_user())
def debate():
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415
    data = sanitize_input(request.get_json() or {})
    prompt = (data.get("prompt") or "").strip()
    context = (data.get("context") or "overall").strip()
    raw_models = data.get("models")
    if raw_models is None:
        requested_models: list[str] = []
    elif isinstance(raw_models, list):
        requested_models = []
        for model in raw_models:
            value = str(model).strip()
            if value:
                requested_models.append(value)
    else:
        return jsonify({"error": "models must be a list"}), 400
    if len(requested_models) > MAX_MODELS_PER_REQUEST:
        return (
            jsonify({"error": (f"models cannot exceed {MAX_MODELS_PER_REQUEST} entries")}),
            400,
        )
    pii_protection = _coerce_bool(data.get("pii_protection"), default=True)
    pii_override = _coerce_bool(data.get("pii_override"), default=False)
    raw_deadline = data.get("deadline_ms")
    deadline_ms: Optional[int] = None
    if raw_deadline is not None:
        try:
            deadline_ms = int(raw_deadline)
        except (TypeError, ValueError):
            return jsonify({"error": "deadline_ms must be an integer"}), 400
        if deadline_ms <= 0:
            deadline_ms = None
        else:
            deadline_ms = min(deadline_ms, MAX_DEADLINE_MS)
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    if requested_models and len(requested_models) > MAX_MODELS_PER_REQUEST:
        return (
            jsonify(
                {
                    "error": "Too many models requested",
                    "max_models": MAX_MODELS_PER_REQUEST,
                }
            ),
            400,
        )
    try:
        session_id = request.headers.get("X-API-Key", "anonymous")
        log_event(
            "debate.start",
            _current_actor(),
            {"session_id": session_id, "context": context},
        )
        result = engine.run(
            session_id=session_id,
            query=prompt,
            requested_models=requested_models,
            user=_current_user(),
            pii_protection=pii_protection,
            pii_override=pii_override,
            deadline_ms=deadline_ms,
        )
        log_event(
            "debate.end",
            _current_actor(),
            {"session_id": session_id, "context": context},
        )
        sanitized_prompt, _ = redact_and_detect(prompt)
        _audit_put(
            {
                "user_id": session_id,
                "timestamp": dt.utcnow().isoformat(),
                "event": "debate",
                "prompt": sanitized_prompt[:300],
                "context": context,
                "log_type": "debate",
                "ttl": int(time.time()) + 60 * 60 * 24 * 90,
            }
        )
        return jsonify(result), 200
    except DeadlineExceeded as exc:
        logger.warning(
            "debate_deadline_exceeded",
            extra={"error": str(exc)},
        )
        return jsonify({"error": "Request deadline exceeded"}), 504
    except Exception:
        logger.error("Error in /debate: %s", traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500


@app.route("/backup", methods=["POST"])
@require_api_key
@limiter.limit("5 per hour")
def backup():
    try:
        _audit_put(
            {
                "user_id": request.headers.get("X-API-Key", "anonymous"),
                "timestamp": dt.utcnow().isoformat(),
                "event": "backup",
                "log_type": "ops",
            }
        )
        return jsonify({"status": "Backup scheduled", "timestamp": dt.utcnow().isoformat()}), 200
    except Exception:
        logger.error("Backup failed: %s", traceback.format_exc())
        return jsonify({"error": "Backup failed"}), 500


@app.route("/audit", methods=["GET"])
@require_api_key
def audit_logs():
    if not (boto3 and audit_table and Key):
        return jsonify({"logs": []}), 200
    user_id = request.args.get("user_id", "*")
    try:
        if user_id == "*":
            logs = audit_table.scan(Limit=50).get("Items", [])
        else:
            logs = audit_table.query(KeyConditionExpression=Key("user_id").eq(user_id)).get(
                "Items", []
            )
        return jsonify({"logs": logs}), 200
    except Exception:
        logger.error("Audit fetch failed: %s", traceback.format_exc())
        return jsonify({"error": "Audit fetch failed"}), 500


@app.route("/log", methods=["POST"])
@require_api_key
@limiter.limit("60 per minute")
def log_custom():
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415
    data = sanitize_input(request.get_json() or {})
    event = (data.get("event") or "").strip()
    details = (data.get("details") or "").strip()
    if not event:
        return jsonify({"error": "Event name is required"}), 400
    _audit_put(
        {
            "user_id": request.headers.get("X-API-Key", "anonymous"),
            "timestamp": dt.utcnow().isoformat(),
            "event": event,
            "details": details,
            "log_type": "custom",
        }
    )
    return jsonify({"status": "Logged"}), 200


@app.route("/auth/scope", methods=["POST"])
@require_api_key
@limiter.limit("30 per minute")
def assign_scope():
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415
    data = sanitize_input(request.get_json() or {})
    uid, scope = (data.get("user_id") or "").strip(), (data.get("scope") or "").strip()
    if not uid or not scope:
        return jsonify({"error": "User ID and scope are required"}), 400
    if scope not in {"read", "write", "admin"}:
        return jsonify({"error": "Invalid scope. Allowed: read, write, admin"}), 400
    ok = _scope_put(uid, scope)
    if not ok:
        return jsonify({"error": "Failed to persist scope"}), 500
    return jsonify({"status": "Scope assigned", "user_id": uid, "new_scope": scope}), 200


@app.route("/auth/scope/<user_id>", methods=["GET"])
@require_api_key
def fetch_user_scope(user_id):
    scope = _scope_get(user_id)
    if scope:
        return jsonify({"user_id": user_id, "scope": scope}), 200
    return jsonify({"error": "Scope not found"}), 404


@app.route("/webhooks/register", methods=["POST"])
@require_api_key
@limiter.limit("30 per minute")
def register_webhook():
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415
    data = sanitize_input(request.get_json() or {})
    url, event_type = (data.get("url") or "").strip(), (data.get("event") or "").strip()
    u = urlparse(url)
    if not url or not event_type or u.scheme != "https" or not u.netloc:
        return jsonify({"error": "Valid HTTPS URL and event type are required"}), 400
    if not _webhook_store(url, event_type):
        return jsonify({"error": "Failed to store webhook"}), 500
    return jsonify({"status": "Webhook registered", "event": event_type, "url": url}), 200


@app.route("/webhooks/list", methods=["GET"])
@require_api_key
def list_webhooks():
    return jsonify({"webhooks": _webhook_list()}), 200


# --- Autonomous Health Monitor ------------------------------------------------


class HealthMonitor:
    def __init__(
        self,
        *,
        engine,
        connectors,
        memory,
        audit_put=None,
        interval_sec=3600,
        web_check=True,
        start_time: dt | None = None,
    ):
        self.engine = engine
        self.connectors = connectors
        self.memory = memory
        self.audit_put = audit_put
        self.interval = max(60, int(interval_sec))
        self.web_check = bool(web_check)
        self._last = None
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._thr = threading.Thread(target=self._loop, name="nexus.health", daemon=True)
        self._start_time = start_time or dt.utcnow()

    def start(self):
        self._thr.start()

    def stop(self):
        self._stop.set()
        try:
            self._thr.join(timeout=2)
        except Exception as exc:
            logger.debug("health_monitor_join_failed", extra={"error": str(exc)})

    def snapshot(self):
        # Lazy imports to avoid circulars and to work even if some modules are missing
        try:
            from .nexus_config import ping_clouds
        except Exception:

            def ping_clouds():
                return {
                    "aws": {"connected": False},
                    "azure": {"connected": False},
                    "gcp": {"connected": False},
                }

        try:
            from .memory_compute import health_suite, node_health
        except Exception:

            def node_health():
                return {"pid": os.getpid(), "host": socket.gethostname(), "time": int(time.time())}

            def health_suite(_):
                return {
                    "primary": "unknown",
                    "providers": [],
                    "pings": [],
                    "writeVerify": {"ok": False, "ids": []},
                    "node": node_health(),
                }

        snap = {
            "ts": dt.utcnow().isoformat() + "Z",
            "uptime": str(dt.utcnow() - self._start_time).split(".")[0],
            "node": node_health(),
            "clouds": ping_clouds(),
            "memory": health_suite(self.memory),
            "models": {},
            "web": {"providers": [], "ok": 0},
        }

        # Model connector health (True => degraded per your connector semantics)
        for name, conn in self.connectors.items():
            try:
                degraded = bool(conn.health_check()) if hasattr(conn, "health_check") else True
                snap["models"][name] = "Degraded" if degraded else "Healthy"
            except Exception as e:
                snap["models"][name] = f"Error: {e}"

        # Verify web providers (if engine has a retriever)
        if self.web_check and hasattr(self.engine, "web") and self.engine.web:
            ok = 0
            providers = []
            for p in getattr(self.engine.web, "providers", []):
                label = getattr(p, "name", p.__class__.__name__)
                try:
                    res = p.search("site:wikipedia.org test", k=1, images=False)
                    providers.append({"name": label, "ok": bool(res)})
                    ok += int(bool(res))
                except Exception as e:
                    providers.append({"name": label, "ok": False, "error": str(e)})
            snap["web"]["providers"] = providers
            snap["web"]["ok"] = ok

        return snap

    def _loop(self):
        while not self._stop.is_set():
            try:
                snap = self.snapshot()
                with self._lock:
                    self._last = snap
                # Persist to audit table if available
                if callable(self.audit_put):
                    try:
                        self.audit_put(
                            {
                                "user_id": "__system__",
                                "timestamp": dt.utcnow().isoformat(),
                                "event": "health.snapshot",
                                "payload": snap,
                                "log_type": "health",
                                "ttl": int(time.time()) + 60 * 60 * 24 * 90,
                            }
                        )
                    except Exception:
                        logger.warning("health snapshot audit put failed", exc_info=True)
            except Exception:
                logger.exception("health snapshot failed")
            # Sleep until next interval (interruptible)
            self._stop.wait(self.interval)

    def last(self):
        with self._lock:
            return self._last


# Apply production alpha bootstrap (metrics, security headers, gating)
try:
    wire_alpha(app)
except Exception as exc:  # pragma: no cover - should fail fast
    raise AppInitializationError(f"Failed to apply alpha bootstrap: {exc}") from exc


# Instantiate + start (controlled by env)
if os.getenv("NEXUS_HEALTH_ENABLE", "1") not in {"0", "false", "False"}:
    _health = HealthMonitor(
        engine=engine,
        connectors=connectors,
        memory=memory,
        audit_put=_audit_put,
        interval_sec=int(os.getenv("NEXUS_HEALTH_INTERVAL_SEC", "3600")),
        web_check=os.getenv("NEXUS_HEALTH_WEB_CHECK", "1") not in {"0", "false", "False"},
        start_time=start_time,
    )
    _health.start()
    app.config["NEXUS_HEALTH_MONITOR"] = _health
    atexit.register(lambda: _health.stop())
else:
    _health = None
    app.config["NEXUS_HEALTH_MONITOR"] = None
# -----------------------------------------------------------------------------


# --- Health monitor endpoints -------------------------------------------------
@app.route("/health/last", methods=["GET"])
@require_api_key
def health_last():
    if _health and _health.last():
        return jsonify(_health.last()), 200
    # If monitor disabled or first run not completed, compute one synchronously
    if _health:
        snap = _health.snapshot()
        return jsonify(snap), 200
    # Fall back to existing lightweight health
    return jsonify({"status": "ok", "uptime": _uptime(), "note": "monitor disabled"}), 200


@app.route("/health/run", methods=["POST"])
@require_api_key
@limiter.limit("5 per hour")
def health_run():
    if not _health:
        return jsonify({"error": "monitor disabled"}), 400
    snap = _health.snapshot()
    return jsonify(snap), 200


# -----------------------------------------------------------------------------
# -----------------------------------------------------------------------------
# Entrypoint
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() in {"true", "1", "yes"}
    logger.info(f"Starting Nexus on {host}:{port} debug={debug_mode}")
    app.run(host=host, port=port, debug=debug_mode)
