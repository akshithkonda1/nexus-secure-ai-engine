# flask_app.py
from __future__ import annotations
import os
import logging
import traceback
import hmac
import time
import socket
from datetime import datetime as dt
from functools import wraps
from urllib.parse import urlparse
from typing import Dict, Any

from flask import Flask, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix
 
def node_health():
return {
         "pid": os.getpid(),
         "host": socket.gethostname(),
         "time": int(time.time())
                }

# Optional deps
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
    def get_remote_address(): return request.remote_addr  # type: ignore
try:
    from bleach import clean as bleach_clean
except Exception:
    def bleach_clean(x): return x  # type: ignore

# Memory / compute
from memory_compute import (
    InMemoryStore, DynamoDBMemoryStore, FirestoreMemoryStore, AzureBlobMemoryStore,
    MultiMemoryStore, health_suite,
)

# Connectors (expects bootstrap.py exposes _make_connectors(cfg))
from bootstrap import _make_connectors as make_connectors

# Engine
from nexus_engine import Engine

# -----------------------------------------------------------------------------
# App & logging
# -----------------------------------------------------------------------------
app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

logger = logging.getLogger("nexus.flask")
if not logger.handlers:
    h = logging.StreamHandler()
    h.setFormatter(logging.Formatter('{"ts":"%(asctime)s","lvl":"%(levelname)s","msg":"%(message)s"}'))
    logger.addHandler(h)
logger.setLevel(logging.INFO)

start_time = dt.utcnow()

# -----------------------------------------------------------------------------
# Security & guards
# -----------------------------------------------------------------------------
AUTHORIZED_API_KEYS = set(filter(None, os.getenv("AUTHORIZED_API_KEYS", "").split(",")))
TRUSTED_ORIGINS = set(filter(None, os.getenv("TRUSTED_ORIGINS", "").split(",")))
if not AUTHORIZED_API_KEYS or not TRUSTED_ORIGINS:
    raise RuntimeError("Set AUTHORIZED_API_KEYS and TRUSTED_ORIGINS env vars.")

if Talisman:
    Talisman(app, content_security_policy={"default-src": ["'self'"]}, force_https=True)
if CORS:
    CORS(app, origins=list(TRUSTED_ORIGINS), allow_headers=["Content-Type","X-API-Key"], methods=["GET","POST","OPTIONS"])

if Limiter:
    limiter = Limiter(app, key_func=lambda: request.headers.get("X-API-Key") or get_remote_address(),
                      default_limits=["200/day", "50/hour"])
else:
    class _NoLimit:
        def limit(self, *_a, **_k):
            def _wrap(f): return f
            return _wrap
    limiter = _NoLimit()

def _ct_eq(a: str, b: str) -> bool:
    try: return hmac.compare_digest(a, b)
    except Exception: return a == b

def _valid_api_key(k: str) -> bool:
    return any(_ct_eq(k, real) for real in AUTHORIZED_API_KEYS)

def require_api_key(f):
    @wraps(f)
    def _wrap(*args, **kwargs):
        if not _valid_api_key(request.headers.get("X-API-Key","")):
            return jsonify({"error":"Unauthorized"}), 401
        return f(*args, **kwargs)
    return _wrap

@app.before_request
def enforce_https_and_size():
    if not app.debug and request.headers.get("X-Forwarded-Proto","https").lower() != "https":
        return jsonify({"error":"HTTPS required"}), 403
    if request.content_length and request.content_length > 2 * 1024 * 1024:
        return jsonify({"error":"Request too large"}), 413

@app.errorhandler(Exception)
def global_error(e):
    logger.error("Unhandled: %s", traceback.format_exc())
    return jsonify({"error":"Internal server error"}), 500

def sanitize_input(data):
    if isinstance(data, dict): return {k: sanitize_input(v) for k,v in data.items()}
    if isinstance(data, list): return [sanitize_input(v) for v in data]
    if isinstance(data, str):  return bleach_clean(data)
    return data

def _uptime() -> str:
    return str(dt.utcnow() - start_time).split(".")[0]

# -----------------------------------------------------------------------------
# Lightweight cfg -> memory/connectors/engine
# -----------------------------------------------------------------------------
class Cfg: pass

def _env_list(name: str, default_csv: str) -> list[str]:
    return [s.strip() for s in os.getenv(name, default_csv).split(",") if s.strip()]

def build_cfg() -> Cfg:
    c = Cfg()
    c.memory_providers = _env_list("NEXUS_MEM_PROVIDERS", "aws")
    c.memory_fanout_writes = os.getenv("NEXUS_MEM_FANOUT","1") not in {"0","false","False"}
    c.encrypt = os.getenv("NEXUS_ENCRYPT","1") not in {"0","false","False"}
    c.alpha_semantic = float(os.getenv("NEXUS_ALPHA_SEMANTIC","0.5"))
    c.max_context_messages = int(os.getenv("NEXUS_MAX_CTX","8"))
    return c

def build_memory(cfg: Cfg) -> MultiMemoryStore:
    stores = []
    for p in getattr(cfg, "memory_providers", []) or []:
        pl = p.lower()
        if pl == "aws":
            stores.append(DynamoDBMemoryStore(
                os.getenv("NEXUS_DDB_MESSAGES","nexus_messages"),
                os.getenv("NEXUS_DDB_INDEX","nexus_memindex"),
                os.getenv("AWS_REGION","us-east-1"),
            ))
        elif pl == "gcp":
            stores.append(FirestoreMemoryStore(os.getenv("NEXUS_FS_PREFIX","nexus")))
        elif pl == "azure":
            stores.append(AzureBlobMemoryStore(
                container=os.getenv("NEXUS_AZ_CONTAINER","nexus-messages"),
                prefix=os.getenv("NEXUS_AZ_PREFIX","nexus"),
                connection_string=os.getenv("AZURE_STORAGE_CONNECTION_STRING"),
            ))
        else:
            stores.append(InMemoryStore())
    if not stores:
        stores.append(InMemoryStore())
    return MultiMemoryStore(stores, fanout_writes=getattr(cfg, "memory_fanout_writes", True))

cfg = build_cfg()
memory = build_memory(cfg)
connectors = make_connectors(cfg)
engine = Engine(
    connectors=connectors,
    memory=memory,
    resolver_like=None,
    encrypt=cfg.encrypt,
    alpha_semantic=cfg.alpha_semantic,
    max_context_messages=cfg.max_context_messages,
)

# Optional DynamoDB resources for audit/scope/webhooks
try:
    import boto3
    from boto3.dynamodb.conditions import Key
    ddb = boto3.resource("dynamodb", region_name=os.getenv("AWS_REGION", "us-east-1"))
    audit_table = ddb.Table(os.getenv("DYNAMODB_AUDIT_TABLE", "NexusAuditLogs"))
    scope_table = ddb.Table(os.getenv("DYNAMODB_SCOPE_TABLE", "NexusUserScopes"))
    webhook_table = ddb.Table(os.getenv("DYNAMODB_WEBHOOK_TABLE", "NexusWebhooks"))
except Exception:
    boto3 = None
    Key = None
    audit_table = scope_table = webhook_table = None

def _audit_put(item: Dict[str, Any]) -> None:
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
# Routes
# -----------------------------------------------------------------------------
@app.route("/", methods=["GET"])
@require_api_key
def home():
    return jsonify({
        "message": "✅ Nexus AI is secure and online",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "uptime": _uptime(),
        "routes": ["/debate","/backup","/status","/log","/auth/scope","/webhooks/register","/webhooks/list","/audit","/auth/scope/<user_id>"]
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status":"ok","uptime":_uptime()}), 200

@app.route("/status", methods=["GET"])
@require_api_key
@limiter.limit("30 per minute")
def status():
    model_report = {}
    for name, conn in connectors.items():
        try:
            degraded = bool(getattr(conn, "health_check")()) if hasattr(conn, "health_check") else False
            model_report[name] = "Degraded" if degraded else "Healthy"
        except Exception as e:
            model_report[name] = f"Error: {e}"
    return jsonify({
        "status":"🟢 Running",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "uptime": _uptime(),
        "models": model_report,
        "memory": health_suite(memory),
    }), 200

@app.route("/debate", methods=["POST"])
@require_api_key
@limiter.limit("20 per minute")
def debate():
    if not request.is_json:
        return jsonify({"error":"Request must be application/json"}), 415
    data = sanitize_input(request.get_json() or {})
    prompt = (data.get("prompt") or "").strip()
    context = (data.get("context") or "overall").strip()
    if not prompt:
        return jsonify({"error":"Prompt is required"}), 400
    try:
        session_id = request.headers.get("X-API-Key","anonymous")
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
        return jsonify({"error":"Internal server error"}), 500

@app.route("/backup", methods=["POST"])
@require_api_key
@limiter.limit("5 per hour")
def backup():
    try:
        _audit_put({"user_id": request.headers.get("X-API-Key","anonymous"),
                    "timestamp": dt.utcnow().isoformat(), "event": "backup", "log_type": "ops"})
        return jsonify({"status":"Backup scheduled","timestamp": dt.utcnow().isoformat()}), 200
    except Exception:
        logger.error("Backup failed: %s", traceback.format_exc())
        return jsonify({"error":"Backup failed"}), 500

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
            logs = audit_table.query(KeyConditionExpression=Key("user_id").eq(user_id)).get("Items", [])
        return jsonify({"logs": logs}), 200
    except Exception:
        logger.error("Audit fetch failed: %s", traceback.format_exc())
        return jsonify({"error":"Audit fetch failed"}), 500

@app.route("/log", methods=["POST"])
@require_api_key
@limiter.limit("60 per minute")
def log_custom():
    if not request.is_json:
        return jsonify({"error":"Request must be application/json"}), 415
    data = sanitize_input(request.get_json() or {})
    event = (data.get("event") or "").strip()
    details = (data.get("details") or "").strip()
    if not event:
        return jsonify({"error":"Event name is required"}), 400
    _audit_put({"user_id": request.headers.get("X-API-Key","anonymous"),
                "timestamp": dt.utcnow().isoformat(), "event": event, "details": details, "log_type": "custom"})
    return jsonify({"status":"Logged"}), 200

@app.route("/auth/scope", methods=["POST"])
@require_api_key
@limiter.limit("30 per minute")
def assign_scope():
    if not request.is_json:
        return jsonify({"error":"Request must be application/json"}), 415
    data = sanitize_input(request.get_json() or {})
    uid, scope = (data.get("user_id") or "").strip(), (data.get("scope") or "").strip()
    if not uid or not scope:
        return jsonify({"error":"User ID and scope are required"}), 400
    if scope not in {"read","write","admin"}:
        return jsonify({"error":"Invalid scope. Allowed: read, write, admin"}), 400
    ok = _scope_put(uid, scope)
    if not ok:
        return jsonify({"error":"Failed to persist scope"}), 500
    return jsonify({"status":"Scope assigned","user_id": uid,"new_scope": scope}), 200

@app.route("/auth/scope/<user_id>", methods=["GET"])
@require_api_key
def fetch_user_scope(user_id):
    scope = _scope_get(user_id)
    if scope:
        return jsonify({"user_id": user_id, "scope": scope}), 200
    return jsonify({"error":"Scope not found"}), 404

@app.route("/webhooks/register", methods=["POST"])
@require_api_key
@limiter.limit("30 per minute")
def register_webhook():
    if not request.is_json:
        return jsonify({"error":"Request must be application/json"}), 415
    data = sanitize_input(request.get_json() or {})
    url, event_type = (data.get("url") or "").strip(), (data.get("event") or "").strip()
    u = urlparse(url)
    if not url or not event_type or u.scheme != "https" or not u.netloc:
        return jsonify({"error":"Valid HTTPS URL and event type are required"}), 400
    if not _webhook_store(url, event_type):
        return jsonify({"error":"Failed to store webhook"}), 500
    return jsonify({"status":"Webhook registered","event": event_type,"url": url}), 200

@app.route("/webhooks/list", methods=["GET"])
@require_api_key
def list_webhooks():
    return jsonify({"webhooks": _webhook_list()}), 200
# --- Autonomous Health Monitor ------------------------------------------------
import threading, atexit

class HealthMonitor:
    def __init__(self, *, engine, connectors, memory, audit_put=None,
                 interval_sec=3600, web_check=True):
        self.engine = engine
        self.connectors = connectors
        self.memory = memory
        self.audit_put = audit_put
        self.interval = max(60, int(interval_sec))
        self.web_check = bool(web_check)
        self._last = None
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._thr = threading.Thread(target=self._loop,
                                     name="nexus.health",
                                     daemon=True)

    def start(self):
        self._thr.start()

    def stop(self):
        self._stop.set()
        try:
            self._thr.join(timeout=2)
        except Exception:
            pass

    def snapshot(self):
        # Lazy imports to avoid circulars and to work even if some modules are missing
        try:
            from nexus_config import ping_clouds
        except Exception:
            def ping_clouds(): return {"aws":{"connected":False}, "azure":{"connected":False}, "gcp":{"connected":False}}

        try:
            from memory_compute import health_suite, node_health
        except Exception:
            def node_health(): return {"pid": os.getpid(), "host": socket.gethostname(), "time": int(time.time())}
            def health_suite(_): return {"primary":"unknown","providers":[],"pings":[],"writeVerify":{"ok":False,"ids":[]},"node":node_health()}

        snap = {
            "ts": dt.utcnow().isoformat() + "Z",
            "uptime": str(dt.utcnow() - start_time).split(".")[0],
            "node": node_health(),
            "clouds": ping_clouds(),
            "memory": health_suite(self.memory),
            "models": {},
            "web": {"providers": [], "ok": 0}
        }

        # Model connector health (True => degraded per your connector semantics)
        for name, conn in self.connectors.items():
            try:
                degraded = bool(conn.health_check()) if hasattr(conn, "health_check") else True
                snap["models"][name] = "Degraded" if degraded else "Healthy"
            except Exception as e:
                snap["models"][name] = f"Error: {e}"

        # Verify web providers (if engine has a retriever)
        if self.web_check and hasattr(self.engine, "web") and getattr(self.engine, "web"):
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
                        self.audit_put({
                            "user_id": "__system__",
                            "timestamp": dt.utcnow().isoformat(),
                            "event": "health.snapshot",
                            "payload": snap,
                            "log_type": "health",
                            "ttl": int(time.time()) + 60*60*24*90
                        })
                    except Exception:
                        logger.warning("health snapshot audit put failed", exc_info=True)
            except Exception:
                logger.exception("health snapshot failed")
            # Sleep until next interval (interruptible)
            self._stop.wait(self.interval)

    def last(self):
        with self._lock:
            return self._last

# Instantiate + start (controlled by env)
if os.getenv("NEXUS_HEALTH_ENABLE", "1") not in {"0", "false", "False"}:
    _health = HealthMonitor(
        engine=engine,
        connectors=connectors,
        memory=memory,
        audit_put=_audit_put if " _audit_put" not in globals() else _audit_put,  # use if defined
        interval_sec=int(os.getenv("NEXUS_HEALTH_INTERVAL_SEC", "3600")),
        web_check=os.getenv("NEXUS_HEALTH_WEB_CHECK", "1") not in {"0", "false", "False"},
    )
    _health.start()
    atexit.register(lambda: _health.stop())
else:
    _health = None
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
    return jsonify({"status":"ok","uptime": _uptime(), "note":"monitor disabled"}), 200

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
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() in {"true","1","yes"}
    logger.info(f"Starting Nexus on {host}:{port} debug={debug_mode}")
    app.run(host=host, port=port, debug=debug_mode)



