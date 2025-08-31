#What is Nexus?

#Nexus is a sophisticated AI engine designed to aggregate and analyze responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries.

#It integrates web scraping capabilities for real-time data retrieval, supports secure data encryption, and offers advanced response aggregation techniques to deliver the best possible answers.

#Nexus is built to be extensible and infinitely scalable, allowing for easy integration of new AI models and data sources, making it a versatile tool for developers and researchers alike, but it is also designed to be user-friendly, with a focus on providing clear and actionable insights.

#Nexus is not just a tool for AI enthusiasts; it is a powerful platform that can be used in various applications, from academic research to business intelligence, and it aims to democratize access to advanced AI capabilities by making Gen AI replies more accurate and more correct.

#Nexus is a cutting-edge AI engine that aggregates and analyzes responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries. 
# Nexus also includes powerful 256-bit AES encryption for secure data handling, ensuring that sensitive information is protected throughout the process.

#It combines the power of multiple AI models with the richness of web data, enabling users to gain deeper insights and make more informed decisions, using AI Modal Debating you will get the best possible answer to your question, by combining the strengths of multiple AI models and traditional search engines and media.

#Nexus was developed by Akshith Konda.

#What is Nexus?

#Nexus is a sophisticated AI engine designed to aggregate and analyze responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries.

#It integrates web scraping capabilities for real-time data retrieval, supports secure data encryption, and offers advanced response aggregation techniques to deliver the best possible answers.

#Nexus is built to be extensible and infinitely scalable, allowing for easy integration of new AI models and data sources, making it a versatile tool for developers and researchers alike, but it is also designed to be user-friendly, with a focus on providing clear and actionable insights.

#Nexus is not just a tool for AI enthusiasts; it is a powerful platform that can be used in various applications, from academic research to business intelligence, and it aims to democratize access to advanced AI capabilities by making Gen AI replies more accurate and more correct.

#Nexus is a cutting-edge AI engine that aggregates and analyzes responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries. 
# Nexus also includes powerful 256-bit AES encryption for secure data handling, ensuring that sensitive information is protected throughout the process.

#It combines the power of multiple AI models with the richness of web data, enabling users to gain deeper insights and make more informed decisions, using AI Modal Debating you will get the best possible answer to your question, by combining the strengths of multiple AI models and traditional search engines and media.

#Nexus was developed by Akshith Konda.

# nexus_config.py
# Production-ready configuration & bootstrap for Nexus (+ wizard for shared infra)
# - SecretResolver with TTL cache, multi-cloud providers, and strict validation
# - Cloud health checks (safe, lazy imports, bounded errors)
# - Memory wiring (multi-provider, ordered read / fan-out write)
# - Connector construction with HTTPS enforcement and auth header controls
# - Engine assembly (no circular imports)
# - Interactive wizard for Nexus + InfraOps + Log Analyzer shared cloud setup

from __future__ import annotations

import json
import logging
import os
import re
import time
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

# -----------------------------------------------------------------------------#
# Structured logging (JSON) with basic redaction
# -----------------------------------------------------------------------------#
class JsonFormatter(logging.Formatter):
    REDACT_KEYS = ("password", "secret", "token", "key", "authorization", "auth")

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": int(time.time()),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        extra = getattr(record, "extra", None)
        if isinstance(extra, dict):
            safe = {}
            for k, v in extra.items():
                if any(rk in k.lower() for rk in self.REDACT_KEYS):
                    safe[k] = "***"
                else:
                    safe[k] = v
            payload.update(safe)
        return json.dumps(payload, ensure_ascii=False)

logger = logging.getLogger("nexus.config")
if not logger.handlers:
    h = logging.StreamHandler()
    h.setFormatter(JsonFormatter())
    logger.addHandler(h)
logger.setLevel(logging.INFO)

# -----------------------------------------------------------------------------#
# Local imports (module names must match filenames)
# -----------------------------------------------------------------------------#
from nexus_engine import ModelConnector, Engine
from nexus_memory_compute import (
    MultiMemoryStore, DynamoDBMemoryStore, FirestoreMemoryStore, AzureBlobMemoryStore,
    ping_memory_store, verify_memory_writes, load_terraform_outputs, backup_to_targets
)

# -----------------------------------------------------------------------------#
# Utilities
# -----------------------------------------------------------------------------#
CONFIG_JSON_PATH = os.path.join(os.path.dirname(__file__), "nexus_shared_config.json")

def _is_https_url(url: Optional[str]) -> bool:
    if not url or not isinstance(url, str):
        return False
    try:
        p = urlparse(url)
        return p.scheme == "https" and bool(p.netloc)
    except Exception:
        return False

def _coalesce_env(*names: str, default: Optional[str] = None) -> Optional[str]:
    for n in names:
        v = os.getenv(n)
        if v:
            return v
    return default

# -----------------------------------------------------------------------------#
# Secrets (multi-cloud) with TTL cache + overrides
# -----------------------------------------------------------------------------#
class SecretResolver:
    """
    Resolution order per logical name `name`:
      1) overrides[name]
      2) cloud secret via providers in order ['aws','azure','gcp'] using overrides:
         - NEXUS_SECRET_<name> (secret id/key) + optional NEXUS_SECRET_<name>_FIELD (JSON field path)
    """
    def __init__(self, providers: List[str], overrides: Optional[Dict[str, str]] = None, ttl_seconds: int = 600):
        prov = [p.strip().lower() for p in (providers or []) if p.strip()]
        if not prov:
            raise RuntimeError("SecretResolver requires at least one provider, e.g., ['aws']")
        self.providers = prov
        self.ov = overrides or {}
        self.ttl = max(1, int(ttl_seconds))
        self._cache: Dict[str, Optional[str]] = {}
        self._ts: Dict[str, float] = {}
        self._aws_sm = None
        self._az_client_obj = None
        self._gcp_sm = None

    def get(self, name: str, default: Optional[str] = None) -> Optional[str]:
        now = time.time()
        try:
            if name in self._cache and (now - self._ts.get(name, 0.0)) < self.ttl:
                return self._cache[name]
            # 1) Direct override
            if name in self.ov and self.ov[name] is not None:
                self._cache[name] = self.ov[name]; self._ts[name] = now
                return self.ov[name]
            # 2) Secret indirection
            sid = self.ov.get(f"NEXUS_SECRET_{name}")
            field = self.ov.get(f"NEXUS_SECRET_{name}_FIELD")
            if sid:
                for p in self.providers:
                    try:
                        if p == "aws":
                            val = self._aws_get(sid, field)
                        elif p == "azure":
                            val = self._az_get(sid, field)
                        elif p == "gcp":
                            val = self._gcp_get(sid, field)
                        else:
                            continue
                        if val:
                            self._cache[name] = val; self._ts[name] = now
                            return val
                    except Exception as e:
                        logger.error("secret resolve failed", extra={"provider": p, "name": name, "error": str(e)})
            # 3) Default
            self._cache[name] = default; self._ts[name] = now
            return default
        except Exception as e:
            logger.error("secret resolve fatal", extra={"name": name, "error": str(e)})
            return default

    # --- AWS
    def _aws_client(self):
        if self._aws_sm is None:
            try:
                import boto3
                self._aws_sm = boto3.client("secretsmanager")
            except Exception as e:
                raise RuntimeError(f"AWS Secrets Manager client init failed: {e}")
        return self._aws_sm

    def _aws_get(self, secret_id: str, field: Optional[str]) -> Optional[str]:
        raw = self._aws_client().get_secret_value(SecretId=secret_id).get("SecretString")
        return _json_field(raw, field) if raw is not None else None

    # --- Azure
    def _az_client(self):
        if self._az_client_obj is None:
            try:
                from azure.identity import DefaultAzureCredential
                from azure.keyvault.secrets import SecretClient
                url = self.ov.get("AZURE_KEYVAULT_URL") or os.getenv("AZURE_KEYVAULT_URL")
                if not url:
                    raise RuntimeError("AZURE_KEYVAULT_URL required for Azure secret resolution")
                self._az_client_obj = SecretClient(vault_url=url, credential=DefaultAzureCredential())
            except Exception as e:
                raise RuntimeError(f"Azure Key Vault client init failed: {e}")
        return self._az_client_obj

    def _az_get(self, name: str, field: Optional[str]) -> Optional[str]:
        v = self._az_client().get_secret(name).value
        return _json_field(v, field)

    # --- GCP
    def _gcp_client(self):
        if self._gcp_sm is None:
            try:
                from google.cloud import secretmanager
                self._gcp_sm = secretmanager.SecretManagerServiceClient()
            except Exception as e:
                raise RuntimeError(f"GCP Secret Manager client init failed: {e}")
        return self._gcp_sm

    def _gcp_get(self, secret_id: str, field: Optional[str]) -> Optional[str]:
        client = self._gcp_client()
        if "/" in secret_id:
            name = f"{secret_id}/versions/latest" if "/versions/" not in secret_id else secret_id
        else:
            project = self.ov.get("GCP_PROJECT") or os.getenv("GCP_PROJECT")
            if not project:
                raise RuntimeError("GCP_PROJECT required for short secret ids")
            name = f"projects/{project}/secrets/{secret_id}/versions/latest"
        raw = client.access_secret_version(request={"name": name}).payload.data.decode("utf-8")
        return _json_field(raw, field)

def _json_field(raw: Optional[str], field: Optional[str]) -> Optional[str]:
    if raw is None or not field:
        return raw
    try:
        cur: Any = json.loads(raw)
    except Exception:
        return None
    for part in field.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return None
    return cur if isinstance(cur, str) else json.dumps(cur)

# -----------------------------------------------------------------------------#
# Cloud pings (ANY connected cloud passes). Non-fatal; bounded calls.
# -----------------------------------------------------------------------------#
def ping_clouds() -> Dict[str, Dict[str, Any]]:
    status: Dict[str, Dict[str, Any]] = {}

    # AWS
    try:
        import boto3
        sts = boto3.client("sts"); _ = sts.get_caller_identity()
        s3  = boto3.client("s3");  _ = s3.list_buckets()
        ec2 = boto3.client("ec2"); _ = ec2.describe_regions(AllRegions=False)
        status["aws"] = {"connected": True, "services": ["sts", "s3", "ec2"]}
    except Exception as e:
        status["aws"] = {"connected": False, "error": str(e)}

    # Azure
    try:
        from azure.storage.blob import BlobServiceClient
        conn = _coalesce_env("AZURE_STORAGE_CONNECTION_STRING")
        if conn:
            svc = BlobServiceClient.from_connection_string(conn)
            _ = svc.get_service_properties()
            status["azure"] = {"connected": True, "services": ["blob"]}
        else:
            status["azure"] = {"connected": False, "error": "AZURE_STORAGE_CONNECTION_STRING not set"}
    except Exception as e:
        status["azure"] = {"connected": False, "error": str(e)}

    # GCP
    try:
        from google.cloud import storage
        client = storage.Client()
        _ = list(client.list_buckets(page_size=1))
        status["gcp"] = {"connected": True, "services": ["gcs"]}
    except Exception as e:
        status["gcp"] = {"connected": False, "error": str(e)}

    return status

# -----------------------------------------------------------------------------#
# Wiring helpers (connectors + memory)
# -----------------------------------------------------------------------------#
def make_connectors(resolver: SecretResolver, timeout: int = 12, retries: int = 3) -> Dict[str, ModelConnector]:
    """
    Build model connectors from secrets/env. Enforces HTTPS endpoints and sets Authorization
    only when a key/token is present (prevents sending 'Bearer None').
    NOTE: If you prefer cloud delegates only, set require_any_connector=False in NexusConfig
    and let the engine (delegate-aware) handle *_DELEGATE overrides.
    """
    api_key             = resolver.get("OPENAI_API_KEY") or _coalesce_env("OPENAI_API_KEY")
    gpt_endpoint        = resolver.get("GPT_ENDPOINT") or _coalesce_env("GPT_ENDPOINT")
    claude_endpoint     = resolver.get("CLAUDE_ENDPOINT") or _coalesce_env("CLAUDE_ENDPOINT")
    gemini_endpoint     = resolver.get("GEMINI_ENDPOINT") or _coalesce_env("GEMINI_ENDPOINT")
    perplexity_endpoint = resolver.get("PERPLEXITY_ENDPOINT") or _coalesce_env("PERPLEXITY_ENDPOINT")

    conns: Dict[str, ModelConnector] = {}

    def add(name: str, ep: Optional[str], key: Optional[str]):
        if not ep:
            return
        if not _is_https_url(ep):
            raise ValueError(f"Connector endpoint for {name} must be HTTPS: {ep}")
        headers = {"Authorization": f"Bearer {key}"} if key else None
        conns[name] = ModelConnector(name, ep, headers=headers, timeout=timeout, max_retries=retries)

    add("ChatGPT",    gpt_endpoint,        api_key)
    add("Claude",     claude_endpoint,     api_key)
    add("Gemini",     gemini_endpoint,     api_key)
    add("Perplexity", perplexity_endpoint, api_key)

    return conns

def make_memory(preferred: List[str], tf_outputs: Optional[Dict[str, Any]] = None) -> MultiMemoryStore:
    """
    Create a MultiMemoryStore with ordered providers. The first provider is the primary reader;
    writes fan out to all stores.
    """
    stores: List[Any] = []
    tf_outputs = tf_outputs or {}
    for p in preferred or []:
        pl = p.strip().lower()
        if pl == "aws":
            msg_tbl = tf_outputs.get("ddb_messages_table") or os.getenv("NEXUS_DDB_MESSAGES", "nexus_messages")
            idx_tbl = tf_outputs.get("ddb_index_table")    or os.getenv("NEXUS_DDB_INDEX", "nexus_memindex")
            stores.append(DynamoDBMemoryStore(msg_tbl, idx_tbl))
        elif pl == "gcp":
            fs_prefix = tf_outputs.get("fs_prefix") or os.getenv("NEXUS_FS_PREFIX", "nexus")
            stores.append(FirestoreMemoryStore(fs_prefix))
        elif pl == "azure":
            container = tf_outputs.get("az_blob_container") or os.getenv("NEXUS_AZ_CONTAINER", "nexus-messages")
            prefix    = tf_outputs.get("az_blob_prefix")    or os.getenv("NEXUS_AZ_PREFIX", "nexus")
            conn      = tf_outputs.get("az_blob_connection_string") or os.getenv("AZURE_STORAGE_CONNECTION_STRING")
            stores.append(AzureBlobMemoryStore(container=container, prefix=prefix, connection_string=conn))
        else:
            raise RuntimeError(f"Unknown memory provider: {p}")
    if not stores:
        raise RuntimeError("No memory providers configured")
    return MultiMemoryStore(stores)

# -----------------------------------------------------------------------------#
# Public bootstrap: the simple, opinionated entrypoint
# -----------------------------------------------------------------------------#
@dataclass
class NexusConfig:
    # Choose any subset in order of read priority; writes fan-out to all.
    memory_providers: List[str] = field(default_factory=lambda: ["aws"])
    # Secrets providers order + overrides
    secret_providers: List[str] = field(default_factory=lambda: ["aws"])
    secret_overrides: Dict[str, str] = field(default_factory=dict)
    secret_ttl_seconds: int = 600
    # Backups: list of targets (provider, bucket/container/vault, key, tier)
    backup_targets: List[Dict[str, Any]] = field(default_factory=list)
    backup_min_success: int = 1
    # Optional path to terraform outputs JSON file
    terraform_outputs_path: Optional[str] = None
    # Engine options
    encrypt: bool = True
    http_timeout_seconds: int = 12
    http_max_retries: int = 3
    # Startup write test toggles
    verify_memory_write: bool = True
    memory_write_trials: int = 2
    # Optional: require at least one connector present
    require_any_connector: bool = True

def bootstrap_from_preferences(cfg: NexusConfig) -> Tuple[Engine, Dict[str, Any]]:
    """
    Assemble the Engine and return (engine, health dict).
    Raises on critical configuration issues (e.g., no connectors when required).
    """
    tf_out = load_terraform_outputs(cfg.terraform_outputs_path)

    # Secrets
    resolver = SecretResolver(cfg.secret_providers, cfg.secret_overrides, cfg.secret_ttl_seconds)

    # Connectors
    connectors = make_connectors(resolver, timeout=cfg.http_timeout_seconds, retries=cfg.http_max_retries)
    if cfg.require_any_connector and not connectors:
        raise RuntimeError("No model endpoints configured. Set GPT/Claude/Gemini/Perplexity endpoints in secrets/env.")

    # Memory
    memory = make_memory(cfg.memory_providers, tf_out)

    # Cloud & memory health (non-fatal; collected for visibility)
    clouds = ping_clouds()
    try:
        mem_health = [ping_memory_store(s) for s in memory.stores]
    except Exception as e:
        mem_health = [{"ok": False, "error": str(e)}]

    write_ok, write_ids = (True, [])
    if cfg.verify_memory_write:
        try:
            write_ok, write_ids = verify_memory_writes(memory.primary, "__nexus_ping__", trials=max(1, cfg.memory_write_trials))
        except Exception as e:
            write_ok, write_ids = (False, [])
            logger.error("memory write verify failed", extra={"error": str(e)})

    backup_report = None
    test_path = os.getenv("NEXUS_BACKUP_TEST_FILE")
    if cfg.backup_targets and test_path and os.path.isfile(test_path):
        try:
            backup_report = backup_to_targets(test_path, cfg.backup_targets, min_success=max(1, cfg.backup_min_success))
            if not backup_report.get("ok"):
                raise RuntimeError(f"Backup quorum failed: {backup_report}")
        except Exception as e:
            raise RuntimeError(f"Backup self-check failed: {e}")

    # Engine
    eng = Engine(
        connectors=connectors,
        memory_store=memory,
        resolver_like=resolver,
        encrypt=cfg.encrypt,
    )

    health = {
        "clouds": clouds,
        "memory": mem_health,
        "memoryWriteOK": write_ok,
        "memoryWriteIDs": write_ids,
        "backupReport": backup_report,
        "connectors": sorted(list(connectors.keys())),
    }
    return eng, health

# -----------------------------------------------------------------------------#
# Interactive Wizard (for Nexus + InfraOps + Log Analyzer)
# -----------------------------------------------------------------------------#
_REGION_RE = re.compile(r"^[a-z]{2}-[a-z]+-\d+$")  # e.g., us-east-1

def _ask(prompt: str, default: Optional[str] = None, allow_blank: bool = False) -> str:
    while True:
        raw = input(f"{prompt}{f' [{default}]' if default else ''}: ").strip()
        if not raw and default is not None:
            return default
        if raw or allow_blank:
            return raw
        print("Please enter a value.")

def _ask_int(prompt: str, *, min_value: Optional[int] = None, max_value: Optional[int] = None) -> int:
    while True:
        raw = input(f"{prompt}: ").strip()
        try:
            val = int(raw)
            if min_value is not None and val < min_value:
                print(f"Value must be ≥ {min_value}."); continue
            if max_value is not None and val > max_value:
                print(f"Value must be ≤ {max_value}."); continue
            return val
        except Exception:
            print("Please enter a whole number.")

def _confirm(prompt: str, default: bool = True) -> bool:
    suffix = "[Y/n]" if default else "[y/N]"
    while True:
        raw = input(f"{prompt} {suffix}: ").strip().lower()
        if not raw: return default
        if raw in ("y", "yes"): return True
        if raw in ("n", "no"):  return False
        print("Please enter y or n.")

def _ask_choice(prompt: str, options: List[str], multi: bool = False) -> List[str]:
    print(prompt)
    for i, opt in enumerate(options, 1):
        print(f"  {i}) {opt}")
    while True:
        raw = input(f"Enter {'comma-separated numbers' if multi else 'a number'}: ").strip()
        parts = [p.strip() for p in raw.split(",")] if multi else [raw]
        try:
            idxs = [int(p) for p in parts if p]
            if not idxs: raise ValueError
            if any(i < 1 or i > len(options) for i in idxs): raise ValueError
            chosen = []
            seen = set()
            for i in idxs:
                if options[i-1] not in seen:
                    chosen.append(options[i-1]); seen.add(options[i-1])
            return chosen
        except Exception:
            print("Invalid selection, try again.")

def _ask_https(prompt: str) -> str:
    while True:
        url = _ask(prompt)
        if _is_https_url(url):
            return url
        print("Must be an https:// URL")

def _ask_region(default: str = "us-east-1") -> str:
    while True:
        r = _ask("AWS region", default=default)
        if _REGION_RE.match(r): return r
        print("Region should look like 'us-east-1'.")

def _ask_b64_key(prompt: str) -> str:
    val = _ask(prompt + " (base64; 32 bytes) — press Enter to skip", allow_blank=True)
    if not val: return ""
    if not re.fullmatch(r"[A-Za-z0-9+/=]+", val):
        print("That doesn't look like base64. Ignoring; engine will generate an ephemeral key.")
        return ""
    return val

def _configure_aws(overrides: Dict[str, str], shared: Dict[str, Any]) -> Tuple[List[str], List[Dict[str, Any]], Dict[str, str]]:
    print("\nAWS configuration")
    acct = _ask("AWS Account ID (optional)", allow_blank=True)
    region = _ask_region()
    ddb_table = _ask("DynamoDB table name for messages", default="nexus_messages")
    ddb_index = _ask("DynamoDB GSI name for memory index", default="nexus_memindex")
    cw_group  = _ask("CloudWatch Log Group for shared logs (InfraOps/Log Analyzer)", default="/aws/nexus/shared")
    s3_backup = _ask("S3 bucket for backups/exports (optional)", allow_blank=True)
    s3_prefix = _ask("S3 key prefix for backups (optional)", allow_blank=True) if s3_backup else ""

    # Model calling mode
    mode = _ask_choice("Model invocation mode on AWS?", ["Delegates (Lambda) — recommended", "Direct HTTPS endpoints (dev)"], multi=False)[0]
    if mode.startswith("Delegates"):
        gpt_fn   = _ask("Lambda for GPT (e.g., nexus-gpt-proxy)", allow_blank=True)
        claude_fn= _ask("Lambda for Claude", allow_blank=True)
        gemini_fn= _ask("Lambda for Gemini", allow_blank=True)
        pplx_fn  = _ask("Lambda for Perplexity", allow_blank=True)
        if gpt_fn:    overrides["NEXUS_SECRET_GPT_DELEGATE"]        = f"aws:lambda:{gpt_fn}@{region}"
        if claude_fn: overrides["NEXUS_SECRET_CLAUDE_DELEGATE"]     = f"aws:lambda:{claude_fn}@{region}"
        if gemini_fn: overrides["NEXUS_SECRET_GEMINI_DELEGATE"]     = f"aws:lambda:{gemini_fn}@{region}"
        if pplx_fn:   overrides["NEXUS_SECRET_PERPLEXITY_DELEGATE"] = f"aws:lambda:{pplx_fn}@{region}"
        shared["prefer_delegates"] = True
    else:
        # Endpoints + secret IDs (NOT keys)
        if _confirm("Configure GPT endpoint?", True):
            overrides["GPT_ENDPOINT"] = _ask_https("GPT HTTPS endpoint")
            overrides["NEXUS_SECRET_OPENAI_API_KEY"] = _ask("Secret ID for OpenAI API key (AWS SM)")
            field = _ask("Optional JSON field path in secret (e.g., apiKey)", allow_blank=True)
            if field: overrides["NEXUS_SECRET_OPENAI_API_KEY_FIELD"] = field
        if _confirm("Configure Claude endpoint?", False):
            overrides["CLAUDE_ENDPOINT"] = _ask_https("Claude HTTPS endpoint")
            overrides["NEXUS_SECRET_ANTHROPIC_API_KEY"] = _ask("Secret ID for Anthropic API key (AWS SM)")
        if _confirm("Configure Gemini endpoint?", False):
            overrides["GEMINI_ENDPOINT"] = _ask_https("Gemini HTTPS endpoint")
            overrides["NEXUS_SECRET_GOOGLE_API_KEY"] = _ask("Secret ID for Google API key (AWS SM)")
        if _confirm("Configure Perplexity endpoint?", False):
            overrides["PERPLEXITY_ENDPOINT"] = _ask_https("Perplexity HTTPS endpoint")
            overrides["NEXUS_SECRET_PERPLEXITY_API_KEY"] = _ask("Secret ID for Perplexity API key (AWS SM)")
        shared["prefer_delegates"] = shared.get("prefer_delegates", False)

    # Memory env (for runtime)
    os.environ["NEXUS_DDB_MESSAGES"] = ddb_table
    os.environ["NEXUS_DDB_INDEX"] = ddb_index

    # Shared logging & backups (for InfraOps & Log Analyzer)
    shared.setdefault("logs", {})["aws"] = {"account": acct, "region": region, "cloudwatch_group": cw_group}
    backups: List[Dict[str, Any]] = []
    if s3_backup:
        backups.append({"provider": "aws", "bucket": s3_backup, "key": s3_prefix or "backups/", "tier": "STANDARD"})

    # Encryption key (optional)
    data_key_b64 = _ask_b64_key("Encryption data key for at-rest (optional)")
    if data_key_b64:
        overrides["NEXUS_DATA_KEY_B64"] = data_key_b64

    providers = ["aws"]
    return providers, backups, overrides

def _configure_gcp(overrides: Dict[str, str], shared: Dict[str, Any]) -> Tuple[List[str], List[Dict[str, Any]], Dict[str, str]]:
    print("\nGCP configuration")
    project = _ask("GCP Project ID")
    region  = _ask("Preferred GCP region", default="us-central1")
    fs_prefix = _ask("Firestore prefix for memory", default="nexus")
    log_sink  = _ask("GCP Logging sink name for shared logs (optional)", allow_blank=True)
    gcs_bucket= _ask("GCS bucket for backups/exports (optional)", allow_blank=True)
    gcs_prefix= _ask("GCS prefix for backups (optional)", allow_blank=True) if gcs_bucket else ""

    mode = _ask_choice("Model invocation mode on GCP?", ["Delegates (Cloud Run) — recommended", "Direct HTTPS endpoints (dev)"], multi=False)[0]
    if mode.startswith("Delegates"):
        gemini_url = _ask_https("Cloud Run URL for Gemini delegate") if _confirm("Configure Gemini delegate?", True) else ""
        gpt_url    = _ask_https("Cloud Run URL for GPT delegate") if _confirm("Configure GPT delegate?", False) else ""
        pplx_url   = _ask_https("Cloud Run URL for Perplexity delegate") if _confirm("Configure Perplexity delegate?", False) else ""
        if gemini_url: overrides["NEXUS_SECRET_GEMINI_DELEGATE"] = f"gcp:run:{gemini_url}"
        if gpt_url:    overrides["NEXUS_SECRET_GPT_DELEGATE"]    = f"gcp:run:{gpt_url}"
        if pplx_url:   overrides["NEXUS_SECRET_PERPLEXITY_DELEGATE"] = f"gcp:run:{pplx_url}"
        shared["prefer_delegates"] = True
    else:
        if _confirm("Configure Gemini endpoint?", True):
            overrides["GEMINI_ENDPOINT"] = _ask_https("Gemini HTTPS endpoint")
            overrides["NEXUS_SECRET_GOOGLE_API_KEY"] = _ask("Secret ID for Google API key (GCP SM)")
        if _confirm("Configure GPT endpoint?", False):
            overrides["GPT_ENDPOINT"] = _ask_https("GPT HTTPS endpoint")
            overrides["NEXUS_SECRET_OPENAI_API_KEY"] = _ask("Secret ID for OpenAI API key (GCP SM)")
        if _confirm("Configure Perplexity endpoint?", False):
            overrides["PERPLEXITY_ENDPOINT"] = _ask_https("Perplexity HTTPS endpoint")
            overrides["NEXUS_SECRET_PERPLEXITY_API_KEY"] = _ask("Secret ID for Perplexity API key (GCP SM)")
        shared["prefer_delegates"] = shared.get("prefer_delegates", False)

    overrides["GCP_PROJECT"] = project
    os.environ["NEXUS_FS_PREFIX"] = fs_prefix

    shared.setdefault("logs", {})["gcp"] = {"project": project, "region": region, "sink": log_sink}
    backups: List[Dict[str, Any]] = []
    if gcs_bucket:
        backups.append({"provider": "gcp", "bucket": gcs_bucket, "key": gcs_prefix or "backups/", "tier": "STANDARD"})

    data_key_b64 = _ask_b64_key("Encryption data key for at-rest (optional)")
    if data_key_b64:
        overrides["NEXUS_DATA_KEY_B64"] = data_key_b64

    providers = ["gcp"]
    return providers, backups, overrides

def _configure_azure(overrides: Dict[str, str], shared: Dict[str, Any]) -> Tuple[List[str], List[Dict[str, Any]], Dict[str, str]]:
    print("\nAzure configuration")
    kv_url  = _ask_https("Azure Key Vault URL (e.g., https://YOUR-VAULT.vault.azure.net)")
    az_cont = _ask("Azure Blob container for memory", default="nexus-messages")
    az_pref = _ask("Azure Blob prefix for memory", default="nexus")
    la_ws   = _ask("Log Analytics workspace ID for shared logs (optional)", allow_blank=True)
    sa_conn = _ask("Azure Storage connection string (for Blob) — optional", allow_blank=True)
    bak_cont= _ask("Azure Blob container for backups (optional)", allow_blank=True)
    bak_pref= _ask("Backups prefix (optional)", allow_blank=True) if bak_cont else ""

    mode = _ask_choice("Model invocation mode on Azure?", ["Delegates (Function/APIM) — recommended", "Direct HTTPS endpoints (dev)"], multi=False)[0]
    if mode.startswith("Delegates"):
        claude_fn = _ask_https("Function URL for Claude delegate") if _confirm("Configure Claude delegate?", True) else ""
        gpt_fn    = _ask_https("Function URL for GPT delegate") if _confirm("Configure GPT delegate?", False) else ""
        gemini_fn = _ask_https("Function URL for Gemini delegate") if _confirm("Configure Gemini delegate?", False) else ""
        if claude_fn: overrides["NEXUS_SECRET_CLAUDE_DELEGATE"] = f"azure:function:{claude_fn}"
        if gpt_fn:    overrides["NEXUS_SECRET_GPT_DELEGATE"]    = f"azure:function:{gpt_fn}"
        if gemini_fn: overrides["NEXUS_SECRET_GEMINI_DELEGATE"] = f"azure:function:{gemini_fn}"
        shared["prefer_delegates"] = True
    else:
        if _confirm("Configure Claude endpoint?", True):
            overrides["CLAUDE_ENDPOINT"] = _ask_https("Claude HTTPS endpoint")
            overrides["NEXUS_SECRET_ANTHROPIC_API_KEY"] = _ask("Secret ID for Anthropic API key (Key Vault name)")
        if _confirm("Configure GPT endpoint?", False):
            overrides["GPT_ENDPOINT"] = _ask_https("GPT HTTPS endpoint")
            overrides["NEXUS_SECRET_OPENAI_API_KEY"] = _ask("Secret ID for OpenAI API key (Key Vault name)")
        if _confirm("Configure Gemini endpoint?", False):
            overrides["GEMINI_ENDPOINT"] = _ask_https("Gemini HTTPS endpoint")
            overrides["NEXUS_SECRET_GOOGLE_API_KEY"] = _ask("Secret ID for Google API key (Key Vault name)")
        shared["prefer_delegates"] = shared.get("prefer_delegates", False)

    overrides["AZURE_KEYVAULT_URL"] = kv_url
    os.environ["NEXUS_AZ_CONTAINER"] = az_cont
    os.environ["NEXUS_AZ_PREFIX"] = az_pref
    if sa_conn:
        os.environ["AZURE_STORAGE_CONNECTION_STRING"] = sa_conn

    shared.setdefault("logs", {})["azure"] = {"key_vault": kv_url, "log_analytics_workspace": la_ws}
    backups: List[Dict[str, Any]] = []
    if bak_cont:
        backups.append({"provider": "azure", "container": bak_cont, "key": bak_pref or "backups/", "tier": "Hot"})

    data_key_b64 = _ask_b64_key("Encryption data key for at-rest (optional)")
    if data_key_b64:
        overrides["NEXUS_DATA_KEY_B64"] = data_key_b64

    providers = ["azure"]
    return providers, backups, overrides

def run_setup_wizard() -> NexusConfig:
    print("Welcome to the Nexus setup wizard.\n")
    # Age gate
    name = _ask("What is your name")
    age  = _ask_int("What is your age", min_value=0)
    if age < 10:
        print(f"Sorry {name}, you must be 10 or older to use this system.")
        raise SystemExit(1)
    print(f"Hi {name}! Let's configure your shared cloud infrastructure for Nexus, InfraOps, and Log Analyzer.\n")

    # Choose clouds
    clouds = _ask_choice("Which cloud provider(s) will you use? (multi-select)", ["AWS", "Azure", "GCP"], multi=True)

    # Base collections
    overrides: Dict[str, str] = {}
    secret_providers: List[str] = []
    memory_providers: List[str] = []
    backup_targets: List[Dict[str, Any]] = []
    shared: Dict[str, Any] = {"apps": ["Nexus", "InfraOps", "LogAnalyzer"]}

    # Configure per-cloud
    for c in clouds:
        if c == "AWS":
            prov, backs, overrides = _configure_aws(overrides, shared)
            secret_providers += prov; memory_providers += prov; backup_targets += backs
        elif c == "GCP":
            prov, backs, overrides = _configure_gcp(overrides, shared)
            secret_providers += prov; memory_providers += prov; backup_targets += backs
        elif c == "Azure":
            prov, backs, overrides = _configure_azure(overrides, shared)
            secret_providers += prov; memory_providers += prov; backup_targets += backs

    # De-duplicate while preserving order
    def _uniq(seq: List[str]) -> List[str]:
        seen, out = set(), []
        for s in seq:
            if s not in seen:
                seen.add(s); out.append(s)
        return out

    secret_providers = _uniq([p.lower() for p in secret_providers]) or ["aws", "azure", "gcp"]
    memory_providers = _uniq([p.lower() for p in memory_providers]) or ["aws"]

    # Shared knobs
    ttl_sec = _ask_int("Secret cache TTL (seconds)", min_value=60)
    run_health = _confirm("Run health checks at startup?", False)
    require_connectors = not shared.get("prefer_delegates", False)  # if delegates, allow engine to provide connectors

    cfg = NexusConfig(
        memory_providers=memory_providers,
        secret_providers=secret_providers,
        secret_overrides=overrides,
        secret_ttl_seconds=ttl_sec,
        backup_targets=backup_targets,
        backup_min_success=1 if backup_targets else 0,
        terraform_outputs_path=None,
        encrypt=True,
        http_timeout_seconds=12,
        http_max_retries=3,
        verify_memory_write=True,
        memory_write_trials=2,
        require_any_connector=require_connectors,
    )

    # Persist a shared JSON for other apps (InfraOps/Log Analyzer)
    shared_json = {
        "owner": {"name": name, "age_ok": True},
        "secret_providers": secret_providers,
        "memory_providers": memory_providers,
        "secret_overrides": overrides,   # contains delegate specs and non-secret context (no API keys)
        "backups": backup_targets,
        "logs": shared.get("logs", {}),
        "prefer_delegates": shared.get("prefer_delegates", False),
    }
    try:
        with open(CONFIG_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(shared_json, f, indent=2)
        print(f"\nSaved shared config: {CONFIG_JSON_PATH}")
    except Exception as e:
        logger.error("failed to write shared config", extra={"error": str(e)})

    return cfg

# -----------------------------------------------------------------------------#
# CLI bootstrap
# -----------------------------------------------------------------------------#
if __name__ == "__main__":
    # Run the wizard by default for simpler onboarding; set NEXUS_WIZARD=0 to skip.
    if os.getenv("NEXUS_WIZARD", "1") == "1":
        cfg = run_setup_wizard()
    else:
        # Non-interactive fallback (single-cloud AWS quick bootstrap)
        cfg = NexusConfig(
            memory_providers=[os.getenv("NEXUS_MEM", "aws")],
            secret_providers=[os.getenv("NEXUS_SECRETS", "aws")],
            secret_overrides={},
            backup_targets=[],
            verify_memory_write=(os.getenv("NEXUS_VERIFY_WRITE", "1") != "0"),
        )
    try:
        engine, health = bootstrap_from_preferences(cfg)
        print(json.dumps(health, indent=2))
    except Exception as e:
        logger.error("bootstrap failed", extra={"error": str(e)})
        raise
#End of Engine code# 
#Nexus is an advanced orchestration engine for LLMs and memory stores across AWS, Azure, and GCP, designed for secure, scalable AI applications.
# #It supports dynamic secret resolution, multi-cloud memory management, and flexible model connectors.
