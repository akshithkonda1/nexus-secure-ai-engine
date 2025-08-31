# nexus_flask_app.py
from __future__ import annotations
import os, logging, traceback, hmac, time, json
from datetime import datetime as dt
from urllib.parse import urlparse
from functools import wraps
from flask import Flask, request, jsonify

# Optional deps (graceful fallback)
try:
    from flask_cors import CORS
except Exception:
    CORS = None
try:
    from flask_talisman import Talisman
except Exception:
    Talisman = None
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
except Exception:
    Limiter = None
    def get_remote_address(): return request.remote_addr
try:
    from bleach import clean as bleach_clean
except Exception:
    def bleach_clean(x): return x

# Config
from config import load_and_validate

# Connectors (keep using bootstrap’s factory)
try:
    from bootstrap import _make_connectors as make_connectors
except Exception as e:
    raise RuntimeError("bootstrap.py with _make_connectors is required") from e

# Engine (NoOp fallback)
try:
    from engine import Engine
except Exception:
    class Engine:
        def __init__(self, **_): pass
        def run(self, session_id: str, query: str):
            return {"answers": {}, "ranking": {"tfidf": [], "semantic": [], "preferred": None}}

# Memory/Compute (integrated here)
try:
    from memory_compute import (
        MultiMemoryStore,
        DynamoDBMemoryStore,
        FirestoreMemoryStore,
        AzureBlobMemoryStore,
        InMemoryStore,
        ping_memory_store,
    )
except Exception:
    class InMemoryStore:
        def recent(self, *a, **k): return []
        def save(self, *a, **k): return True
    class _Multi:
        def __init__(self, stores, fanout_writes=True):
            self.stores = stores
            self.primary = stores[0] if stores else InMemoryStore()
    MultiMemoryStore = _Multi
    def DynamoDBMemoryStore(*a, **k): return InMemoryStore()
    def FirestoreMemoryStore(*a, **k): return InMemoryStore()
    def AzureBlobMemoryStore(*a, **k): return InMemoryStore()
    def ping_memory_store(_): return {"ok": True}

def _make_memory_from_cfg(cfg):
    stores = []
    for p in (cfg.memory_providers or []):
        p = p.lower().strip()
        if p == "aws":
            stores.append(DynamoDBMemoryStore(
                os.getenv("NEXUS_DDB_MESSAGES", "nexus_messages"),
                os.getenv("NEXUS_DDB_INDEX", "nexus_memindex"),
            ))
        elif p == "gcp":
            stores.append(FirestoreMemoryStore(os.getenv("NEXUS_FS_PREFIX", "nexus")))
        elif p == "azure":
            stores.append(AzureBlobMemoryStore(
                container=os.getenv("NEXUS_AZ_CONTAINER", "nexus-messages"),
                prefix=os.getenv("NEXUS_AZ_PREFIX", "nexus"),
                connection_string=os.getenv("AZURE_STORAGE_CONNECTION_STRING"),
            ))
        elif p == "memory":
            stores.append(InMemoryStore())
        else:
            stores.append(InMemoryStore())
    if not stores:
        stores.append(InMemoryStore())
    return MultiMemoryStore(stores, fanout_writes=getattr(cfg, "memory_fanout_writes", True))

# DynamoDB (optional)
try:
    import boto3
    from boto3.dynamodb.conditions import Key
except Exception:
    boto3 = None
    Key = None

# -----------------------------------------------------------------------------
# App & logging
# -----------------------------------------------------------------------------
logger = logging.getLogger("nexus_app")
if not logger.handlers:
    h = logging.StreamHandler()
    h.setFormatter(logging.Formatter('{"ts":"%(asctime)s","lvl":"%(levelname)s","msg":"%(message)s"}'))
    logger.addHandler(h)
logger.setLevel(logging.INFO)

app = Flask(__name__)
start_time = dt.utcnow()

# -----------------------------------------------------------------------------
# Security config
# -----------------------------------------------------------------------------
AUTHORIZED_API_KEYS = set(filter(None, os.getenv("AUTHORIZED_API_KEYS", "").split(",")))
TRUSTED_ORIGINS = set(filter(None, os.getenv("TRUSTED_ORIGINS", "").split(",")))
if not AUTHORIZED_API_KEYS or not TRUSTED_ORIGINS:
    raise RuntimeError("Set AUTHORIZED_API_KEYS and TRUSTED_ORIGINS env vars.")

if Talisman:
    Talisman(app, content_security_policy={"default-src": ["'self'"]}, force_https=True)
if CORS:
    CORS(app, origins=list(TRUSTED_ORIGINS), allow_headers=["Content-Type", "X-API-Key"], methods=["GET","POST","OPTIONS"])

if Limiter:
    limiter = Limiter(app, key_func=lambda: request.headers.get("X-API-Key") or get_remote_address(),
                      default_limits=["200/day", "50/hour"])
else:
    class _NoLimit:
        def limit(self, *_a, **_k):
            def _wrap(f): return f
            return _wrap
    limiter = _NoLimit()

def _constant_time_eq(a: str, b: str) -> bool:
    try:
        return hmac.compare_digest(a, b)
    except Exception:
        return a == b

def _valid_api_key(provided: str) -> bool:
    return any(_constant_time_eq(provided, real) for real in AUTHORIZED_API_KEYS)

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        key = request.headers.get("X-API-Key", "")
        if not _valid_api_key(key):
            logger.warning("Unauthorized access")
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

# -----------------------------------------------------------------------------
# Config, connectors, memory, engine
# -----------------------------------------------------------------------------
cfg_path = os.getenv("NEXUS_CONFIG_PATH", "nexus_config.json")
cfg, errs = load_and_validate(paths=[cfg_path] if cfg_path else None)
if errs:
    raise SystemExit(" | ".join(errs))

memory = _make_memory_from_cfg(cfg)
connectors = make_connectors(cfg)
engine = Engine(
    connectors=connectors,
    memory=memory,
    resolver_like=None,
    encrypt=cfg.encrypt,
    alpha_semantic=cfg.alpha_semantic,
    max_context_messages=cfg.max_context_messages,
)

# -----------------------------------------------------------------------------
# Optional DynamoDB tables
# -----------------------------------------------------------------------------
audit_table = scope_table = webhook_table = None
if boto3:
    try:
        ddb = boto3.resource("dynamodb", region_name=os.getenv("AWS_REGION", "us-east-1"))
        audit_table = ddb.Table(os.getenv("DYNAMODB_AUDIT_TABLE", "NexusAuditLogs"))
        scope_table = ddb.Table(os.getenv("DYNAMODB_SCOPE_TABLE", "NexusUserScopes"))
        webhook_table = ddb.Table(os.getenv("DYNAMODB_WEBHOOK_TABLE", "NexusWebhooks"))
    except Exception as e:
        logger.warning(f"DynamoDB disabled: {e}")

def _audit_put(item: dict) -> None:
    if audit_table:
        try: audit_table.put_item(Item=item)
        except Exception as e: logger.warning(f"audit put failed: {e}")

def _scope_put(user_id: str, scope: str) -> bool:
    if scope_table:
        try:
            scope_table.put_item(Item={"user_id": user_id, "scope": scope, "updated_at": dt.utcnow().isoformat()})
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
            if u.scheme != "https" or not u.netloc: return False
            webhook_table.put_item(Item={
                "url": url, "event": event_type, "created_at": dt.utcnow().isoformat(),
                "ttl": int(time.time()) + 60*60*24*30
            })
            return True
        except Exception as e:
            logger.warning(f"webhook put failed: {e}")
    return False

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def sanitize_input(data):
    if isinstance(data, dict): return {k: sanitize_input(v) for k,v in data.items()}
    if isinstance(data, list): return [sanitize_input(v) for v in data]
    if isinstance(data, str):  return bleach_clean(data)
    return data

def get_uptime() -> str:
    return str(dt.utcnow() - start_time).split(".")[0]

@app.errorhandler(Exception)
def global_error_handler(e):
    logger.error("Unhandled exception: %s", traceback.format_exc())
    return jsonify({"error": "Internal server error"}), 500

@app.before_request
def enforce_https_and_size():
    if not app.debug and request.headers.get("X-Forwarded-Proto", "https").lower() != "https":
        return jsonify({"error": "HTTPS required"}), 403
    if request.content_length and request.content_length > 2 * 1024 * 1024:
        return jsonify({"error": "Request too large"}), 413

# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------
@app.route("/", methods=["GET"])
@require_api_key
def home():
    return jsonify({
        "message": "✅ Nexus AI is secure and online",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "uptime": get_uptime(),
        "routes": ["/debate","/backup","/status","/log","/auth/scope","/webhooks/register","/webhooks/list","/audit","/auth/scope/<user_id>"]
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "uptime": get_uptime()}), 200

@app.route("/status", methods=["GET"])
@require_api_key
@limiter.limit("30 per minute")
def status():
    model_report = {}
    for name, conn in connectors.items():
        try:
            degraded = False
            if hasattr(conn, "health_check"):
                degraded = bool(conn.health_check())
            model_report[name] = "Degraded" if degraded else "Healthy"
        except Exception as e:
            model_report[name] = f"Error: {e}"

    mem_report = []
    try:
        for s in getattr(memory, "stores", []):
            mem_report.append(ping_memory_store(s))
    except Exception as e:
        mem_report.append({"ok": False, "error": str(e)})

    return jsonify({
        "status": "🟢 Running",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "uptime": get_uptime(),
        "models": model_report,
        "memory": mem_report,
    }), 200

@app.route("/debate", methods=["POST"])
@require_api_key
@limiter.limit("20 per minute")
def debate():
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415
    data = sanitize_input(request.get_json() or {})
    prompt = (data.get("prompt") or "").strip()
    context = (data.get("context") or "overall").strip()
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    try:
        session_id = request.headers.get("X-API-Key", "anonymous")
        result = engine.run(session_id=session_id, query=prompt)
        _audit_put({
            "user_id": session_id,
            "timestamp": dt.utcnow().isoformat(),
            "event": "debate",
            "prompt": prompt,
            "context": context,
            "log_type": "debate",
            "ttl": int(time.time()) + 60*60*24*90
        })
        return jsonify(result), 200
    except Exception:
        logger.error("Error in /debate: %s", traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500

@app.route("/backup", methods=["POST"])
@require_api_key
@limiter.limit("5 per hour")
def backup():
    try:
        _audit_put({"user_id": request.headers.get("X-API-Key","anonymous"),
                    "timestamp": dt.utcnow().isoformat(), "event": "backup", "log_type": "ops"})
        return jsonify({"status": "Backup scheduled", "timestamp": dt.utcnow().isoformat()}), 200
    except Exception:
        logger.error("Backup failed: %s", traceback.format_exc())
        return jsonify({"error": "Backup failed"}), 500

@app.route("/audit", methods=["GET"])
@require_api_key
def audit_logs():
    if not boto3 or not audit_table or not Key:
        return jsonify({"logs": []}), 200
    user_id = request.args.get("user_id", "*")
    try:
        if user_id == "*":
            logs = audit_table.scan(Limit=50).get("Items", [])
        else:
            logs = audit_table.query(KeyConditionExpression=Key("user_id").eq(user_id)).get("Items", [])
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
    _audit_put({"user_id": request.headers.get("X-API-Key","anonymous"),
                "timestamp": dt.utcnow().isoformat(), "event": event, "details": details, "log_type": "custom"})
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
    if scope not in {"read","write","admin"}:
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

# -----------------------------------------------------------------------------
# Entry
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() in {"true","1","yes"}
    logger.info(f"Starting Nexus on {host}:{port} debug={debug_mode}")
    app.run(host=host, port=port, debug=debug_mode)
