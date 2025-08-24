import os
import logging
import traceback
import hmac
import time
import shutil
import boto3
from flask import jsonify
from backend_extensions import get_all_webhooks, get_paginated_audit_logs
from main import require_api_key
from backend import get_model_connectors
from datetime import datetime as dt
from datetime import timedelta
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from functools import wraps
from bleach import clean as bleach_clean
from flask_cors import CORS
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from boto3.dynamodb.conditions import Key
from flask import request, jsonify
from backend import APINexus,ModelConnector,scheduled_backup,log_event
from Nexus_ai_API_secrets import get_model_connectors

# Load environment variables
load_dotenv()

# Logging
logger = logging.getLogger("nexus_app")
handler = logging.StreamHandler()
formatter = logging.Formatter(
    '{"timestamp": "%(asctime)s", "level": "%(levelname)s", ' +
    '"module": "%(module)s", "message": %(message)s }'
)
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Flask setup
app = Flask(__name__)
start_time = dt.utcnow()

# Security
AUTHORIZED_API_KEYS = set(filter(None, os.getenv("AUTHORIZED_API_KEYS", "").split(",")))
TRUSTED_ORIGINS = set(filter(None, os.getenv("TRUSTED_ORIGINS", "").split(",")))

if not AUTHORIZED_API_KEYS or not TRUSTED_ORIGINS:
    raise RuntimeError("AUTHORIZED_API_KEYS and TRUSTED_ORIGINS must be set in environment variables.")

Talisman(app, content_security_policy={"default-src": ["'self'"]}, force_https=True)
CORS(app, origins=list(TRUSTED_ORIGINS), allow_headers=["Content-Type", "X-API-Key"], methods=["GET", "POST", "OPTIONS"])
limiter = Limiter(app, key_func=lambda: request.headers.get("X-API-Key") or get_remote_address(), default_limits=["200/day", "50/hour"])

# DynamoDB
dynamodb = boto3.resource("dynamodb")
audit_table = dynamodb.Table(os.getenv("DYNAMODB_AUDIT_TABLE", "NexusAuditLogs"))

# Helpers

def valid_api_key(provided_key: str) -> bool:
    return any(hmac.compare_digest(provided_key, real) for real in AUTHORIZED_API_KEYS)

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        key = request.headers.get("X-API-Key", "")
        if not valid_api_key(key):
            logger.warning(f"Unauthorized access from {request.remote_addr}")
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

def sanitize_input(data):
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(i) for i in data]
    elif isinstance(data, str):
        return bleach_clean(data)
    return data

nexus = APINexus(get_model_connectors())

@app.errorhandler(Exception)
def global_error_handler(e):
    logger.error("Unhandled exception: %s", traceback.format_exc())
    return jsonify({"error": "Internal server error"}), 500

@app.before_request
def enforce_https_and_size():
    if not app.debug and request.headers.get("X-Forwarded-Proto", "http").lower() != "https":
        return jsonify({"error": "HTTPS required"}), 403
    if request.content_length and request.content_length > 2 * 1024 * 1024:
        return jsonify({"error": "Request too large"}), 413

@app.route("/", methods=["GET"])
@require_api_key
def home():
    uptime = str(dt.utcnow() - start_time).split(".")[0]
    return jsonify({
        "message": "✅ Nexus AI is secure and online",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "uptime": uptime,
        "routes": ["/debate", "/backup", "/status", "/log", "/auth/scope", "/webhooks/register", "/audit"]
    }), 200

@app.route("/audit", methods=["GET"])
@require_api_key
def audit_logs():
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

@app.route("/debate", methods=["POST"])
@require_api_key
@limiter.limit("20 per minute")
def debate():
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415
    try:
        data = sanitize_input(request.get_json())
        prompt = data.get("prompt", "").strip()
        context = data.get("context", "overall").strip()
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        result = nexus.secure_debate(prompt, context)
        audit_table.put_item(Item={
            "user_id": request.headers.get("X-API-Key", "anonymous"),
            "timestamp": dt.utcnow().isoformat(),
            "event": "debate",
            "prompt": prompt,
            "log_type": "debate",
            "ttl": int(time.time()) + 60 * 60 * 24 * 90  # 90 days retention
        })
        logger.info(f"Debate executed by {request.remote_addr}")
        return jsonify(result), 200
    except Exception:
        logger.error("Error in /debate: %s", traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500

@app.route("/backup", methods=["POST"])
@require_api_key
@limiter.limit("5 per hour")
def backup():
    try:
        scheduled_backup()
        return jsonify({"status": "Backup complete", "timestamp": dt.utcnow().isoformat()}), 200
    except Exception:
        logger.error("Backup failed: %s", traceback.format_exc())
        return jsonify({"error": "Backup failed"}), 500

@app.route("/status", methods=["GET"])
@require_api_key
@limiter.limit("30 per minute")
def status():
    models = get_model_connectors()
    status_report = {name: "Healthy" if not hasattr(c, "health_check") or c.health_check() else "Degraded" for name, c in models.items()}
    uptime = str(dt.utcnow() - start_time).split(".")[0]
    return jsonify({"status": "🟢 Running", "version": os.getenv("APP_VERSION", "1.0.0"), "uptime": uptime, "models": status_report}), 200

@app.route("/log", methods=["POST"])
@require_api_key
@limiter.limit("60 per minute")
def log_custom():
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415
    data = sanitize_input(request.get_json())
    event = data.get("event", "").strip()
    details = data.get("details", "").strip()
    if not event:
        return jsonify({"error": "Event name is required"}), 400
    log_event(event, details)
    return jsonify({"status": "Logged"}), 200

@app.route("/auth/scope", methods=["POST"])
@require_api_key
@limiter.limit("30 per minute")
def assign_scope():
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415
    data = sanitize_input(request.get_json())
    uid, scope = data.get("user_id", "").strip(), data.get("scope", "").strip()
    if not uid or not scope:
        return jsonify({"error": "User ID and scope are required"}), 400
    if scope not in {"read", "write", "admin"}:
        return jsonify({"error": "Invalid scope. Allowed: read, write, admin"}), 400
    log_event("AuthScopeSet", f"User {uid} assigned to scope {scope}")
    return jsonify({"status": "Scope assigned", "user_id": uid, "new_scope": scope}), 200

@app.route("/webhooks/register", methods=["POST"])
@require_api_key
@limiter.limit("30 per minute")
def register_webhook():
    if not request.is_json:
        return jsonify({"error": "Request must be application/json"}), 415
    data = sanitize_input(request.get_json())
    url, event_type = data.get("url", "").strip(), data.get("event", "").strip()
    parsed = urlparse(url)
    if not url or not event_type or parsed.scheme != "https" or not parsed.netloc:
        return jsonify({"error": "Valid HTTPS URL and event type are required"}), 400
    log_event("WebhookRegistered", f"Webhook for {event_type} at {url}")
    return jsonify({"status": "Webhook registered", "event": event_type, "url": url}), 200

# Entry point
if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug_mode = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")
    logger.info(f"Starting Nexus AI backend on {host}:{port} (debug={debug_mode})")
    app.run(host=host, port=port, debug=debug_mode)
# Additional utility functions and classes for Nexus extensions
# Assumes audit_table and logger are already defined in the main app
# If not, initialize them below

dynamodb = boto3.resource("dynamodb")
audit_table = dynamodb.Table(os.getenv("DYNAMODB_AUDIT_TABLE", "NexusAuditLogs"))
scope_table = dynamodb.Table(os.getenv("DYNAMODB_SCOPE_TABLE", "NexusUserScopes"))
webhook_table = dynamodb.Table(os.getenv("DYNAMODB_WEBHOOK_TABLE", "NexusWebhooks"))

logger = logging.getLogger("nexus_extensions")

# Paged audit log fetch

def get_paginated_audit_logs(user_id: str, limit: int = 25, last_evaluated_key=None):
    try:
        if user_id == "*":
            scan_args = {"Limit": limit}
            if last_evaluated_key:
                scan_args["ExclusiveStartKey"] = last_evaluated_key
            response = audit_table.scan(**scan_args)
        else:
            query_args = {
                "KeyConditionExpression": Key("user_id").eq(user_id),
                "Limit": limit
            }
            if last_evaluated_key:
                query_args["ExclusiveStartKey"] = last_evaluated_key
            response = audit_table.query(**query_args)

        return {
            "logs": response.get("Items", []),
            "last_evaluated_key": response.get("LastEvaluatedKey")
        }
    except Exception as e:
        logger.error("Paginated audit fetch failed: %s", traceback.format_exc())
        return {"error": str(e)}

# Persistent user scope storage

def save_user_scope(user_id: str, scope: str):
    try:
        scope_table.put_item(Item={
            "user_id": user_id,
            "scope": scope,
            "updated_at": dt.utcnow().isoformat()
        })
        return True
    except Exception:
        logger.error("Failed to save user scope: %s", traceback.format_exc())
        return False

def get_user_scope(user_id: str):
    try:
        response = scope_table.get_item(Key={"user_id": user_id})
        return response.get("Item", {}).get("scope")
    except Exception:
        logger.error("Failed to fetch user scope: %s", traceback.format_exc())
        return None

# Webhook persistence

def store_webhook(url: str, event_type: str):
    try:
        parsed = urlparse(url)
        if not parsed.scheme.startswith("https") or not parsed.netloc:
            return False

        webhook_table.put_item(Item={
            "url": url,
            "event": event_type,
            "created_at": dt.utcnow().isoformat(),
            "ttl": int(time.time()) + 60 * 60 * 24 * 30  # 30 days TTL
        })
        return True
    except Exception:
        logger.error("Failed to store webhook: %s", traceback.format_exc())
        return False

def get_all_webhooks():
    try:
        response = webhook_table.scan(Limit=100)
        return response.get("Items", [])
    except Exception:
        logger.error("Failed to get webhooks: %s", traceback.format_exc())
        return []

# Connector Health Base

class HealthCheckMixin:
    def health_check(self) -> bool:
        try:
            test = self.query("Nexus health check", {"test": True})
            return not test.success
        except Exception:
            return True  # True means degraded/issue




scripts = {}

# 1. Webhook listing route
scripts["webhooks_list_route.py"] = """
from flask import jsonify
from backend_extensions import get_all_webhooks
from main import require_api_key

@app.route("/webhooks/list", methods=["GET"])
@require_api_key
def list_webhooks():
    try:
        webhooks = get_all_webhooks()
        return jsonify({"webhooks": webhooks}), 200
    except Exception as e:
        logger.error("Failed to list webhooks: %s", str(e))
        return jsonify({"error": "Unable to fetch webhooks"}), 500
"""

# 2. Scope fetching route
scripts["auth_scope_fetch_route.py"] = """
from flask import request, jsonify
from backend_extensions import get_user_scope
from main import require_api_key

@app.route("/auth/scope/<user_id>", methods=["GET"])
@require_api_key
def fetch_user_scope(user_id):
    try:
        scope = get_user_scope(user_id)
        if scope:
            return jsonify({"user_id": user_id, "scope": scope}), 200
        return jsonify({"error": "Scope not found"}), 404
    except Exception as e:
        logger.error("Failed to fetch scope: %s", str(e))
        return jsonify({"error": "Failed to fetch scope"}), 500
"""

# 3. Cron-compatible auto-cleaner (dry run for TTL pruning)
scripts["ttl_cleanup_lambda.py"] = """
import boto3
import time
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
webhook_table = dynamodb.Table("NexusWebhooks")

def lambda_handler(event, context):
    now = int(time.time())
    scan = webhook_table.scan(Limit=100)
    stale = [item for item in scan.get("Items", []) if item.get("ttl", now) < now]

    for item in stale:
        print(f"Would delete: {item['url']} expired at {item.get('ttl')}")

    return {
        "status": "dry run completed",
        "stale_count": len(stale)
    }
"""

# 4. Health check logger for CloudWatch or future aggregation
scripts["model_health_logger.py"] = """
from datetime import datetime
from backend import get_model_connectors

def log_model_health():
    models = get_model_connectors()
    health_status = {}

    for name, conn in models.items():
        try:
            health = conn.health_check() if hasattr(conn, 'health_check') else False
            health_status[name] = "Degraded" if health else "Healthy"
        except Exception as e:
            health_status[name] = f"Error: {str(e)}"

    for model, status in health_status.items():
        print(f"[{datetime.utcnow().isoformat()}] {model} status: {status}")

if __name__ == "__main__":
    log_model_health()
"""

# 5. Structured audit event generator (dry test)
scripts["generate_test_audit_event.py"] = f"""
import boto3
import time
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
audit_table = dynamodb.Table("NexusAuditLogs")

def generate_demo_event():
    try:
        item = {{
            "user_id": "demo_user",
            "timestamp": datetime.utcnow().isoformat(),
            "event": "DemoEvent",
            "log_type": "system_test",
            "ttl": int(time.time()) + 60 * 60 * 24 * 3  # 3 days
        }}
        audit_table.put_item(Item=item)
        print("Demo event inserted.")
    except Exception as e:
        print(f"Failed to insert audit event: {{str(e)}}")

if __name__ == "__main__":
    generate_demo_event()
"""

# Write scripts to file system
script_dir = "/mnt/data/nexus_demo_scripts"
os.makedirs(script_dir, exist_ok=True)

for filename, content in scripts.items():
    with open(os.path.join(script_dir, filename), "w") as f:
        f.write(content)


shutil.make_archive(script_dir, 'zip', script_dir)

script_dir + ".zip"

# Define additional scripts for admin dashboard and webhook trigger function
extra_scripts = {}

# Admin dashboard route (lightweight internal stats)
extra_scripts["admin_dashboard_route.py"] = """
@app.route("/admin/dashboard", methods=["GET"])
@require_api_key
def admin_dashboard():
    try:
        webhooks = get_all_webhooks()
        audit_info = get_paginated_audit_logs("*", limit=10)
        scopes_count = {}  # Can be added if needed via scope_table scan

        models = get_model_connectors()
        model_health = {name: ("Degraded" if hasattr(c, "health_check") and c.health_check() else "Healthy") for name, c in models.items()}

        return jsonify({
            "webhook_count": len(webhooks),
            "recent_audit_events": audit_info.get("logs", []),
            "model_health": model_health
        }), 200
    except Exception as e:
        logger.error("Dashboard fetch failed: %s", str(e))
        return jsonify({"error": "Dashboard fetch failed"}), 500
"""
# Webhook trigger function (to be called by other routes or admin panel)
extra_scripts["trigger_webhooks.py"] = """
import requests
from backend_extensions import get_all_webhooks
import logging

logger = logging.getLogger("webhook_trigger")

def trigger_webhooks(event_type, payload):
    webhooks = get_all_webhooks()
    matched = [wh for wh in webhooks if wh.get("event") == event_type]

    for wh in matched:
        try:
            resp = requests.post(wh["url"], json=payload, timeout=3)
            logger.info(f"Webhook POST to {wh['url']} returned {resp.status_code}")
        except Exception as e:
            logger.warning(f"Failed to trigger webhook {wh['url']}: {str(e)}")
"""
# Write to script directory and re-archive everything
script_dir = "/mnt/data/nexus_demo_scripts"
os.makedirs(script_dir, exist_ok=True)

# Write the new scripts
for filename, content in extra_scripts.items():
    with open(os.path.join(script_dir, filename), "w") as f:
        f.write(content)

# Repackage the zip archive with the new additions
shutil.make_archive(script_dir, 'zip', script_dir)
# Get a Health Check endpoint in your Flask app
@app.route("/health")
def health():
    return jsonify({"status": "ok", "vm": os.getenv("CLOUD_PROVIDER"), "uptime": get_uptime()}), 200

# Return path to final ZIP archive
script_dir + ".zip"
# Note: To integrate these extensions, simply copy the relevant code snippets into your Nexus_FlaskApp.py or other appropriate files.                             
# To use HealthCheckMixin, have your connectors inherit like:
# class MyConnector(ModelConnector, HealthCheckMixin): ...
# Note: Ensure all environment variables are set properly for security and functionality.
# This includes AUTHORIZED_API_KEYS, TRUSTED_ORIGINS, DYNAMODB_AUDIT_TABLE, FLASK_HOST, FLASK_PORT, and FLASK_DEBUG.