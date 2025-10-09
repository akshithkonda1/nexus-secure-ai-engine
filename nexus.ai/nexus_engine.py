#What is Nexus?

#Nexus is a sophisticated AI engine designed to aggregate and analyze responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries.

#It integrates web scraping capabilities for real-time data retrieval, supports secure data encryption, and offers advanced response aggregation techniques to deliver the best possible answers.

#Nexus is built to be extensible and infinitely scalable, allowing for easy integration of new AI models and data sources, making it a versatile tool for developers and researchers alike, but it is also designed to be user-friendly, with a focus on providing clear and actionable insights.

#Nexus is not just a tool for AI enthusiasts; it is a powerful platform that can be used in various applications, from academic research to business intelligence, and it aims to democratize access to advanced AI capabilities by making Gen AI replies more accurate and more correct.

#Nexus is a cutting-edge AI engine that aggregates and analyzes responses from multiple AI models and traditional search engines and media, providing a comprehensive and nuanced understanding of user queries. 
#Nexus also includes powerful 256-bit AES encryption for secure data handling, ensuring that sensitive information is protected throughout the process.
#It combines the power of multiple AI models with the richness of web data, enabling users to gain deeper insights and make more informed decisions, using AI Modal Debating you will get the best possible answer to your question, by combining the strengths of multiple AI models and traditional search engines and media.

#Nexus was developed by Akshith Konda.
# nexus_engine.py
# engine.py
# Nexus Engine — strict schema + web verification (Google, Bing, Tavily, DuckDuckGo)
# Adds BeautifulSoup scraping to enrich/verify sources and pull photos (og:image).
# engine.py
# Nexus Engine — resilient model debate + verified web evidence + autonomous health checks
# - Adapters: openai.chat, openai.responses, anthropic.messages, gemini.generate,
#             cohere.chat, cohere.generate, tgi.generate, generic.json
# - Web: Google CSE, Bing, Tavily, DuckDuckGo(HTML) + BeautifulSoup scraper
# - Robustness: shared retry helper with backoff+jitter for all web calls
# - Health: hourly (configurable) background checks for connectors, search, scraper, memory, node
"""Secure multi-model orchestration with strict schema guarantees.

This module implements the Nexus engine: a security-focused orchestrator that
routes prompts to multiple AI connectors, verifies answers against web
evidence, and enforces tenant isolation through AES-256-GCM encryption with
per-message nonces and tenant/instance/user-scoped AAD. The response schema is
contractually fixed and must continue to expose the
following non-optional keys for downstream clients:

    {
        "answer": str,
        "winner": str,
        "winner_ref": {"name": str, "adapter": str, "endpoint": str},
        "participants": [str, ...],
        "code": [{"language": str | None, "code": str}, ...],
        "sources": [{"url": str, "title": str | None, "snippet": str | None}, ...],
        "photos": [{"url": str, "caption": str | None}, ...],
        "meta": {"schema_version": str, ...}
    }

The contract above is intentionally narrow for required keys; the ``meta``
object is reserved for additive telemetry (schema version, policy selection,
latency metrics) that clients may ignore safely.
"""

from __future__ import annotations

import json
import logging
import os
import random
import re
import requests
import time
import math
import threading
import shutil
from collections import Counter, deque
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional, Tuple, Deque
from urllib.parse import quote_plus, urlparse, urljoin
from concurrent.futures import ThreadPoolExecutor, as_completed
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import uuid

ENGINE_SCHEMA_VERSION = "1.1.0"
"""Version identifier for the response contract exposed by :class:`Engine`."""

ENGINE_SCHEMA_VERSION = "1.1.0"
"""Version identifier for the response contract exposed by :class:`Engine`."""

class RateLimiter:
    def __init__(self, per_minute: int, burst: int) -> None:
        self.per_minute = per_minute
        self.burst = max(burst, per_minute)
        self._hits: Dict[str, Deque[float]] = {}
        self._lock = threading.Lock()

# =========================================================
# Logging
# =========================================================
class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
        }
        if record.msg:
            payload["event"] = record.getMessage()
        request_id = getattr(record, "request_id", None)
        if request_id:
            payload["request_id"] = request_id
        session_id = getattr(record, "session_id", None)
        if session_id:
            payload["session_id"] = session_id
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def _log_level() -> int:
    explicit = os.getenv("NEXUS_LOG_LEVEL")
    if explicit:
        return getattr(logging, explicit.upper(), logging.INFO)
    env = os.getenv("NEXUS_ENV", "").lower()
    return logging.WARNING if env in {"prod", "production"} else logging.INFO


log = logging.getLogger("nexus.engine")
if not log.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(_JsonFormatter())
    log.addHandler(handler)
log.setLevel(_log_level())


def _remaining_timeout(deadline: Optional[float], default: float) -> float:
    if deadline is None:
        return max(0.2, min(default, MAX_MODEL_TIMEOUT))
    remaining = max(0.0, deadline - time.monotonic())
    if remaining <= 0:
        raise DeadlineExceeded("No time remaining for request")
    return max(0.2, min(remaining, MAX_MODEL_TIMEOUT))


class Crypter:
    """
    AES-256-GCM encrypt/decrypt with per-message nonce and AAD bound to tenant/instance/user/session.
    No plaintext path. No ephemeral keys. Key must come from a secret resolver.
    """
    def encrypt(self, plaintext: str, *, aad: bytes) -> str:
        import base64, os
        nonce = os.urandom(12)
        ct = self._aes.encrypt(nonce, plaintext.encode("utf-8"), aad)
        return base64.b64encode(nonce + ct).decode("ascii")

    def decrypt(self, token: str, *, aad: bytes) -> str:
        import base64
        raw = base64.b64decode(token.encode("ascii"))
        nonce, ct = raw[:12], raw[12:]
        pt = self._aes.decrypt(nonce, ct, aad)
        return pt.decode("utf-8")
    def __init__(self, key_bytes: bytes):
        if len(key_bytes) != 32:
            raise ValueError("AES-256 requires a 32-byte key.")
        self._aes = AESGCM(key_bytes)

    @staticmethod
    def from_resolver(resolver: "SecretResolver") -> "Crypter":
        # Mandatory key in secrets manager; no env/dev fallback; no ephemeral generation.
        b64 = resolver.get("NEXUS_DATA_KEY_B64")
        if not b64:
            raise MisconfigurationError("NEXUS_DATA_KEY_B64 not found in secrets manager (encryption is mandatory).")
        import base64
        key = base64.b64decode(b64)
        return Crypter(key)

_SCRAPE_DENYLIST = _load_scrape_denylist()


class NexusError(Exception):
    """Base exception for Nexus engine errors with structured metadata."""

    code = "internal_error"
    http_status = 500
    default_message = "Internal engine error"

    def __init__(self, message: Optional[str] = None, *, details: Optional[Dict[str, Any]] = None):
        self.message = message or self.default_message
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "code": self.code,
            "message": self.message,
            "http_status": self.http_status,
        }
        if self.details:
            payload["details"] = self.details
        return payload


class MisconfigurationError(NexusError):
    code = "misconfiguration"
    http_status = 500
    default_message = "Engine misconfiguration detected"


class RateLimitExceeded(NexusError):
    code = "rate_limit_exceeded"
    http_status = 429
    default_message = "Rate limit exceeded"


class VerificationError(NexusError):
    code = "verification_failed"
    http_status = 502
    default_message = "Unable to verify model answer"


class DeadlineExceeded(NexusError):
    code = "deadline_exceeded"
    http_status = 504
    default_message = "Deadline exceeded before completion"


class CircuitOpenError(NexusError):
    code = "circuit_open"
    http_status = 503
    default_message = "Circuit breaker open"


class PayloadTooLargeError(NexusError):
    code = "payload_too_large"
    http_status = 413
    default_message = "Payload exceeds configured limits"


class ConnectorError(NexusError):
    code = "connector_error"
    http_status = 502
    default_message = "Connector invocation failed"


def _is_https(url: str) -> bool:
    try:
        p = urlparse(url)
        return p.scheme == "https" and bool(p.netloc)
    except Exception:
        return False


def _is_https_or_local(url: str) -> bool:
    try:
        parsed = urlparse(url)
    except Exception:
        return False
    if parsed.scheme == "https" and bool(parsed.netloc):
        return True
    env = os.getenv("NEXUS_ENV", "").lower()
    if env not in {"prod", "production"} and parsed.scheme == "http":
        host = (parsed.hostname or "").lower()
        if host in {"127.0.0.1", "localhost"}:
            return True
    return False


def _host_allowed(url: str, patterns: Optional[List[str]]) -> bool:
    if not patterns:
        return True
    try:
        host = urlparse(url).netloc.lower()
    except Exception:
        return False
    for pat in patterns:
        pat = pat.strip().lower()
        if not pat:
            continue
        if pat.startswith("*."):
            if host.endswith(pat[1:]):  # ".example.com"
                return True
        elif host == pat:
            return True
    return False


def _host_blocked(url: str, patterns: Optional[List[str]]) -> bool:
    if not patterns:
        return False
    try:
        host = urlparse(url).netloc.lower()
    except Exception:
        return True
    for pat in patterns or []:
        pat = (pat or "").strip().lower()
        if not pat:
            continue
        if pat.startswith("*.") and host.endswith(pat[1:]):
            return True
        if host == pat:
            return True
    return False


def _host_blocked(url: str, patterns: Optional[List[str]]) -> bool:
    if not patterns:
        return False
    try:
        host = urlparse(url).netloc.lower()
    except Exception:
        return True
    for pat in patterns or []:
        pat = (pat or "").strip().lower()
        if not pat:
            continue
        if pat.startswith("*.") and host.endswith(pat[1:]):
            return True
        if host == pat:
            return True
    return False


def _host_blocked(url: str, patterns: Optional[List[str]]) -> bool:
    if not patterns:
        return False
    try:
        host = urlparse(url).netloc.lower()
    except Exception:
        return True
    for pat in patterns or []:
        pat = (pat or "").strip().lower()
        if not pat:
            continue
        if pat.startswith("*.") and host.endswith(pat[1:]):
            return True
        if host == pat:
            return True
    return False


def _host_blocked(url: str, patterns: Optional[List[str]]) -> bool:
    if not patterns:
        return False
    try:
        host = urlparse(url).netloc.lower()
    except Exception:
        return True
    for pat in patterns or []:
        pat = (pat or "").strip().lower()
        if not pat:
            continue
        if pat.startswith("*.") and host.endswith(pat[1:]):
            return True
        if host == pat:
            return True
    return False

# =========================================================
# Retry helper (used by search providers and scraper)
# =========================================================
def _retry_call(
    fn: Callable[[], Any],
    *,
    tries: int = 3,
    base_backoff: float = 0.25,
    max_backoff: float = 4.0,
    jitter: float = 0.5,
    exceptions: Tuple[type, ...] = (Exception,),
) -> Any:
    last = None
    for i in range(max(1, tries)):
        try:
            return fn()
        except exceptions as e:
            last = e
            if i == tries - 1:
                break
            capped = min(max_backoff, base_backoff * (2 ** i))
            sleep_s = random.uniform(0, capped + jitter)
            time.sleep(sleep_s)
    raise last  # pragma: no cover


MAX_MODEL_RESPONSE_BYTES = int(os.getenv("NEXUS_MAX_MODEL_RESPONSE_BYTES", str(2 * 1024 * 1024)))
MAX_MODEL_REQUEST_BYTES = int(os.getenv("NEXUS_MAX_MODEL_REQUEST_BYTES", str(512 * 1024)))
MAX_MODEL_TIMEOUT = float(os.getenv("NEXUS_MAX_MODEL_TIMEOUT", "10.0"))
MAX_SCRAPE_BYTES = int(os.getenv("NEXUS_MAX_SCRAPE_BYTES", str(40 * 1024)))
MAX_DEADLINE_SECONDS = int(os.getenv("NEXUS_MAX_REQUEST_DEADLINE_SECONDS", "60"))


def _load_scrape_denylist() -> List[str]:
    defaults = ["doubleclick.net", "googletagmanager.com", "google-analytics.com"]
    raw = os.getenv("NEXUS_DENY_WEB_DOMAINS", "").strip()
    if not raw:
        return defaults
    items = [p.strip() for p in raw.split(",") if p.strip()]
    return items or defaults


_SCRAPE_DENYLIST = _load_scrape_denylist()
_SCRAPE_ALLOWLIST = [
    p.strip().lower()
    for p in os.getenv("NEXUS_SCRAPE_ALLOW_DOMAINS", "").split(",")
    if p.strip()
]
_RESPECT_ROBOTS = os.getenv("NEXUS_RESPECT_ROBOTS", "0").lower() in {"1", "true", "yes"}

CIRCUIT_THRESHOLD = max(1, int(os.getenv("NEXUS_CIRCUIT_BREAKER_THRESHOLD", "3")))
CIRCUIT_BASE_COOL = float(os.getenv("NEXUS_CIRCUIT_BREAKER_BASE_COOL_SECONDS", "2.0"))
CIRCUIT_MAX_COOL = float(os.getenv("NEXUS_CIRCUIT_BREAKER_MAX_COOL_SECONDS", "120.0"))

RATE_LIMIT_PER_MIN = max(1, int(os.getenv("NEXUS_RATE_LIMIT_PER_MIN", "60")))
RATE_LIMIT_BURST = max(1, int(os.getenv("NEXUS_RATE_LIMIT_BURST", str(RATE_LIMIT_PER_MIN))))
MAX_CONCURRENT_REQUESTS = max(1, int(os.getenv("NEXUS_MAX_CONCURRENT_REQUESTS", "32")))
CONCURRENCY_WAIT_SECONDS = float(os.getenv("NEXUS_CONCURRENCY_WAIT_SECONDS", "5"))


class _CircuitBreaker:
    def __init__(self) -> None:
        self.failures = 0
        self.open_until = 0.0
        self._lock = threading.Lock()

    def allow(self) -> Tuple[bool, float]:
        with self._lock:
            now = time.monotonic()
            if now < self.open_until:
                return False, max(0.0, self.open_until - now)
            return True, 0.0

    def record_success(self) -> None:
        with self._lock:
            self.failures = 0
            self.open_until = 0.0

    def record_failure(self) -> float:
        with self._lock:
            self.failures += 1
            if self.failures < CIRCUIT_THRESHOLD:
                return 0.0
            cool = min(CIRCUIT_MAX_COOL, CIRCUIT_BASE_COOL * (2 ** (self.failures - CIRCUIT_THRESHOLD)))
            self.open_until = time.monotonic() + cool
            return cool


class RateLimiter:
    def __init__(self, per_minute: int, burst: int) -> None:
        self.per_minute = per_minute
        self.burst = max(burst, per_minute)
        self._hits: Dict[str, Deque[float]] = {}
        self._lock = threading.Lock()

    def try_acquire(self, key: str, now: Optional[float] = None) -> Tuple[bool, float]:
        stamp = now or time.time()
        with self._lock:
            q = self._hits.setdefault(key, deque())
            cutoff = stamp - 60.0
            while q and q[0] < cutoff:
                q.popleft()
            if len(q) >= self.burst:
                # Burst window check fires first; callers should treat retry_in as a hard backoff before
                # re-evaluating the rolling per-minute quota.
                retry_in = max(0.0, q[0] + 60.0 - stamp)
                return False, retry_in
            if len(q) >= self.per_minute:
                idx = -self.per_minute
                retry_in = max(0.0, q[idx] + 60.0 - stamp)
                if retry_in > 0:
                    return False, retry_in
            q.append(stamp)
            return True, 0.0


_GLOBAL_RATE_LIMITER = RateLimiter(RATE_LIMIT_PER_MIN, RATE_LIMIT_BURST)
_GLOBAL_CONCURRENCY_SEMAPHORE = threading.BoundedSemaphore(MAX_CONCURRENT_REQUESTS)


def _check_payload_size(payload: Dict[str, Any]) -> None:
    try:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    except Exception as exc:
        raise NexusError("Failed to serialize payload", details={"error": str(exc)}) from exc
    if len(raw) > MAX_MODEL_REQUEST_BYTES:
        raise PayloadTooLargeError(
            f"Payload exceeds {MAX_MODEL_REQUEST_BYTES} bytes limit",
            details={"max_bytes": MAX_MODEL_REQUEST_BYTES, "observed_bytes": len(raw)},
        )


def _remaining_timeout(deadline: Optional[float], default: float) -> float:
    if deadline is None:
        return max(0.2, min(default, MAX_MODEL_TIMEOUT))
    remaining = max(0.0, deadline - time.monotonic())
    if remaining <= 0:
        raise DeadlineExceeded("No time remaining for request")
    return max(0.2, min(remaining, MAX_MODEL_TIMEOUT))


def _limit_body(stream: requests.Response, *, max_bytes: int) -> bytes:
    total = 0
    chunks: List[bytes] = []
    for chunk in stream.iter_content(chunk_size=65536):
        if not chunk:
            continue
        total += len(chunk)
        if total > max_bytes:
            stream.close()
            raise PayloadTooLargeError(
                f"Response exceeded {max_bytes} bytes",
                details={"max_bytes": max_bytes},
            )
        chunks.append(chunk)
    return b"".join(chunks)


MAX_MODEL_RESPONSE_BYTES = int(os.getenv("NEXUS_MAX_MODEL_RESPONSE_BYTES", str(2 * 1024 * 1024)))
MAX_MODEL_REQUEST_BYTES = int(os.getenv("NEXUS_MAX_MODEL_REQUEST_BYTES", str(512 * 1024)))
MAX_MODEL_TIMEOUT = float(os.getenv("NEXUS_MAX_MODEL_TIMEOUT", "10.0"))
MAX_SCRAPE_BYTES = int(os.getenv("NEXUS_MAX_SCRAPE_BYTES", str(40 * 1024)))
MAX_DEADLINE_SECONDS = int(os.getenv("NEXUS_MAX_REQUEST_DEADLINE_SECONDS", "60"))


def _load_scrape_denylist() -> List[str]:
    defaults = ["doubleclick.net", "googletagmanager.com", "google-analytics.com"]
    raw = os.getenv("NEXUS_DENY_WEB_DOMAINS", "").strip()
    if not raw:
        return defaults
    items = [p.strip() for p in raw.split(",") if p.strip()]
    return items or defaults


_SCRAPE_DENYLIST = _load_scrape_denylist()
_SCRAPE_ALLOWLIST = [
    p.strip().lower()
    for p in os.getenv("NEXUS_SCRAPE_ALLOW_DOMAINS", "").split(",")
    if p.strip()
]
_RESPECT_ROBOTS = os.getenv("NEXUS_RESPECT_ROBOTS", "0").lower() in {"1", "true", "yes"}

CIRCUIT_THRESHOLD = max(1, int(os.getenv("NEXUS_CIRCUIT_BREAKER_THRESHOLD", "3")))
CIRCUIT_BASE_COOL = float(os.getenv("NEXUS_CIRCUIT_BREAKER_BASE_COOL_SECONDS", "2.0"))
CIRCUIT_MAX_COOL = float(os.getenv("NEXUS_CIRCUIT_BREAKER_MAX_COOL_SECONDS", "120.0"))

RATE_LIMIT_PER_MIN = max(1, int(os.getenv("NEXUS_RATE_LIMIT_PER_MIN", "60")))
RATE_LIMIT_BURST = max(1, int(os.getenv("NEXUS_RATE_LIMIT_BURST", str(RATE_LIMIT_PER_MIN))))
MAX_CONCURRENT_REQUESTS = max(1, int(os.getenv("NEXUS_MAX_CONCURRENT_REQUESTS", "32")))
CONCURRENCY_WAIT_SECONDS = float(os.getenv("NEXUS_CONCURRENCY_WAIT_SECONDS", "5"))


class _CircuitBreaker:
    def __init__(self) -> None:
        self.failures = 0
        self.open_until = 0.0
        self._lock = threading.Lock()

    def allow(self) -> Tuple[bool, float]:
        with self._lock:
            now = time.monotonic()
            if now < self.open_until:
                return False, max(0.0, self.open_until - now)
            return True, 0.0

    def record_success(self) -> None:
        with self._lock:
            self.failures = 0
            self.open_until = 0.0

    def record_failure(self) -> float:
        with self._lock:
            self.failures += 1
            if self.failures < CIRCUIT_THRESHOLD:
                return 0.0
            cool = min(CIRCUIT_MAX_COOL, CIRCUIT_BASE_COOL * (2 ** (self.failures - CIRCUIT_THRESHOLD)))
            self.open_until = time.monotonic() + cool
            return cool
@dataclass
class AccessContext:
    tenant_id: str
    instance_id: str
    user_id: str

class RateLimiter:
    def __init__(self, per_minute: int, burst: int) -> None:
        self.per_minute = per_minute
        self.burst = max(burst, per_minute)
        self._hits: Dict[str, Deque[float]] = {}
        self._lock = threading.Lock()

    def try_acquire(self, key: str, now: Optional[float] = None) -> Tuple[bool, float]:
        stamp = now or time.time()
        with self._lock:
            q = self._hits.setdefault(key, deque())
            cutoff = stamp - 60.0
            while q and q[0] < cutoff:
                q.popleft()
            if len(q) >= self.burst:
                # Burst window check fires first; callers should treat retry_in as a hard backoff before
                # re-evaluating the rolling per-minute quota.
                retry_in = max(0.0, q[0] + 60.0 - stamp)
                return False, retry_in
            if len(q) >= self.per_minute:
                idx = -self.per_minute
                retry_in = max(0.0, q[idx] + 60.0 - stamp)
                if retry_in > 0:
                    return False, retry_in
            q.append(stamp)
            return True, 0.0


_GLOBAL_RATE_LIMITER = RateLimiter(RATE_LIMIT_PER_MIN, RATE_LIMIT_BURST)
_GLOBAL_CONCURRENCY_SEMAPHORE = threading.BoundedSemaphore(MAX_CONCURRENT_REQUESTS)


def _check_payload_size(payload: Dict[str, Any]) -> None:
    try:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    except Exception as exc:
        raise NexusError("Failed to serialize payload", details={"error": str(exc)}) from exc
    if len(raw) > MAX_MODEL_REQUEST_BYTES:
        raise PayloadTooLargeError(
            f"Payload exceeds {MAX_MODEL_REQUEST_BYTES} bytes limit",
            details={"max_bytes": MAX_MODEL_REQUEST_BYTES, "observed_bytes": len(raw)},
        )


def _remaining_timeout(deadline: Optional[float], default: float) -> float:
    if deadline is None:
        return max(0.2, min(default, MAX_MODEL_TIMEOUT))
    remaining = max(0.0, deadline - time.monotonic())
    if remaining <= 0:
        raise DeadlineExceeded("No time remaining for request")
    return max(0.2, min(remaining, MAX_MODEL_TIMEOUT))


def _limit_body(stream: requests.Response, *, max_bytes: int) -> bytes:
    total = 0
    chunks: List[bytes] = []
    for chunk in stream.iter_content(chunk_size=65536):
        if not chunk:
            continue
        total += len(chunk)
        if total > max_bytes:
            stream.close()
            raise PayloadTooLargeError(
                f"Response exceeded {max_bytes} bytes",
                details={"max_bytes": max_bytes},
            )
        chunks.append(chunk)
    return b"".join(chunks)


MAX_MODEL_RESPONSE_BYTES = int(os.getenv("NEXUS_MAX_MODEL_RESPONSE_BYTES", str(2 * 1024 * 1024)))
MAX_MODEL_REQUEST_BYTES = int(os.getenv("NEXUS_MAX_MODEL_REQUEST_BYTES", str(512 * 1024)))
MAX_MODEL_TIMEOUT = float(os.getenv("NEXUS_MAX_MODEL_TIMEOUT", "10.0"))
MAX_SCRAPE_BYTES = int(os.getenv("NEXUS_MAX_SCRAPE_BYTES", str(40 * 1024)))
MAX_DEADLINE_SECONDS = int(os.getenv("NEXUS_MAX_REQUEST_DEADLINE_SECONDS", "60"))


def _load_scrape_denylist() -> List[str]:
    defaults = ["doubleclick.net", "googletagmanager.com", "google-analytics.com"]
    raw = os.getenv("NEXUS_DENY_WEB_DOMAINS", "").strip()
    if not raw:
        return defaults
    items = [p.strip() for p in raw.split(",") if p.strip()]
    return items or defaults


_SCRAPE_DENYLIST = _load_scrape_denylist()
_SCRAPE_ALLOWLIST = [
    p.strip().lower()
    for p in os.getenv("NEXUS_SCRAPE_ALLOW_DOMAINS", "").split(",")
    if p.strip()
]
_RESPECT_ROBOTS = os.getenv("NEXUS_RESPECT_ROBOTS", "0").lower() in {"1", "true", "yes"}

CIRCUIT_THRESHOLD = max(1, int(os.getenv("NEXUS_CIRCUIT_BREAKER_THRESHOLD", "3")))
CIRCUIT_BASE_COOL = float(os.getenv("NEXUS_CIRCUIT_BREAKER_BASE_COOL_SECONDS", "2.0"))
CIRCUIT_MAX_COOL = float(os.getenv("NEXUS_CIRCUIT_BREAKER_MAX_COOL_SECONDS", "120.0"))

RATE_LIMIT_PER_MIN = max(1, int(os.getenv("NEXUS_RATE_LIMIT_PER_MIN", "60")))
RATE_LIMIT_BURST = max(1, int(os.getenv("NEXUS_RATE_LIMIT_BURST", str(RATE_LIMIT_PER_MIN))))
MAX_CONCURRENT_REQUESTS = max(1, int(os.getenv("NEXUS_MAX_CONCURRENT_REQUESTS", "32")))
CONCURRENCY_WAIT_SECONDS = float(os.getenv("NEXUS_CONCURRENCY_WAIT_SECONDS", "5"))


class _CircuitBreaker:
    def __init__(self) -> None:
        self.failures = 0
        self.open_until = 0.0
        self._lock = threading.Lock()

    def allow(self) -> Tuple[bool, float]:
        with self._lock:
            now = time.monotonic()
            if now < self.open_until:
                return False, max(0.0, self.open_until - now)
            return True, 0.0

    def record_success(self) -> None:
        with self._lock:
            self.failures = 0
            self.open_until = 0.0

    def record_failure(self) -> float:
        with self._lock:
            self.failures += 1
            if self.failures < CIRCUIT_THRESHOLD:
                return 0.0
            cool = min(CIRCUIT_MAX_COOL, CIRCUIT_BASE_COOL * (2 ** (self.failures - CIRCUIT_THRESHOLD)))
            self.open_until = time.monotonic() + cool
            return cool


class RateLimiter:
    def __init__(self, per_minute: int, burst: int) -> None:
        self.per_minute = per_minute
        self.burst = max(burst, per_minute)
        self._hits: Dict[str, Deque[float]] = {}
        self._lock = threading.Lock()

    def try_acquire(self, key: str, now: Optional[float] = None) -> Tuple[bool, float]:
        stamp = now or time.time()
        with self._lock:
            q = self._hits.setdefault(key, deque())
            cutoff = stamp - 60.0
            while q and q[0] < cutoff:
                q.popleft()
            if len(q) >= self.burst:
                # Burst window check fires first; callers should treat retry_in as a hard backoff before
                # re-evaluating the rolling per-minute quota.
                retry_in = max(0.0, q[0] + 60.0 - stamp)
                return False, retry_in
            if len(q) >= self.per_minute:
                idx = -self.per_minute
                retry_in = max(0.0, q[idx] + 60.0 - stamp)
                if retry_in > 0:
                    return False, retry_in
            q.append(stamp)
            return True, 0.0


_GLOBAL_RATE_LIMITER = RateLimiter(RATE_LIMIT_PER_MIN, RATE_LIMIT_BURST)
_GLOBAL_CONCURRENCY_SEMAPHORE = threading.BoundedSemaphore(MAX_CONCURRENT_REQUESTS)


def _check_payload_size(payload: Dict[str, Any]) -> None:
    try:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    except Exception as exc:
        raise NexusError("Failed to serialize payload", details={"error": str(exc)}) from exc
    if len(raw) > MAX_MODEL_REQUEST_BYTES:
        raise PayloadTooLargeError(
            f"Payload exceeds {MAX_MODEL_REQUEST_BYTES} bytes limit",
            details={"max_bytes": MAX_MODEL_REQUEST_BYTES, "observed_bytes": len(raw)},
        )


def _remaining_timeout(deadline: Optional[float], default: float) -> float:
    if deadline is None:
        return max(0.2, min(default, MAX_MODEL_TIMEOUT))
    remaining = max(0.0, deadline - time.monotonic())
    if remaining <= 0:
        raise DeadlineExceeded("No time remaining for request")
    return max(0.2, min(remaining, MAX_MODEL_TIMEOUT))


def _limit_body(stream: requests.Response, *, max_bytes: int) -> bytes:
    total = 0
    chunks: List[bytes] = []
    for chunk in stream.iter_content(chunk_size=65536):
        if not chunk:
            continue
        total += len(chunk)
        if total > max_bytes:
            stream.close()
            raise PayloadTooLargeError(
                f"Response exceeded {max_bytes} bytes",
                details={"max_bytes": max_bytes},
            )
        chunks.append(chunk)
    return b"".join(chunks)


MAX_MODEL_RESPONSE_BYTES = int(os.getenv("NEXUS_MAX_MODEL_RESPONSE_BYTES", str(2 * 1024 * 1024)))
MAX_MODEL_REQUEST_BYTES = int(os.getenv("NEXUS_MAX_MODEL_REQUEST_BYTES", str(512 * 1024)))
MAX_MODEL_TIMEOUT = float(os.getenv("NEXUS_MAX_MODEL_TIMEOUT", "10.0"))
MAX_SCRAPE_BYTES = int(os.getenv("NEXUS_MAX_SCRAPE_BYTES", str(40 * 1024)))
MAX_DEADLINE_SECONDS = int(os.getenv("NEXUS_MAX_REQUEST_DEADLINE_SECONDS", "60"))


def _load_scrape_denylist() -> List[str]:
    defaults = ["doubleclick.net", "googletagmanager.com", "google-analytics.com"]
    raw = os.getenv("NEXUS_DENY_WEB_DOMAINS", "").strip()
    if not raw:
        return defaults
    items = [p.strip() for p in raw.split(",") if p.strip()]
    return items or defaults


_SCRAPE_DENYLIST = _load_scrape_denylist()
_SCRAPE_ALLOWLIST = [
    p.strip().lower()
    for p in os.getenv("NEXUS_SCRAPE_ALLOW_DOMAINS", "").split(",")
    if p.strip()
]
_RESPECT_ROBOTS = os.getenv("NEXUS_RESPECT_ROBOTS", "0").lower() in {"1", "true", "yes"}

CIRCUIT_THRESHOLD = max(1, int(os.getenv("NEXUS_CIRCUIT_BREAKER_THRESHOLD", "3")))
CIRCUIT_BASE_COOL = float(os.getenv("NEXUS_CIRCUIT_BREAKER_BASE_COOL_SECONDS", "2.0"))
CIRCUIT_MAX_COOL = float(os.getenv("NEXUS_CIRCUIT_BREAKER_MAX_COOL_SECONDS", "120.0"))

RATE_LIMIT_PER_MIN = max(1, int(os.getenv("NEXUS_RATE_LIMIT_PER_MIN", "60")))
RATE_LIMIT_BURST = max(1, int(os.getenv("NEXUS_RATE_LIMIT_BURST", str(RATE_LIMIT_PER_MIN))))
MAX_CONCURRENT_REQUESTS = max(1, int(os.getenv("NEXUS_MAX_CONCURRENT_REQUESTS", "32")))
CONCURRENCY_WAIT_SECONDS = float(os.getenv("NEXUS_CONCURRENCY_WAIT_SECONDS", "5"))


class _CircuitBreaker:
    def __init__(self) -> None:
        self.failures = 0
        self.open_until = 0.0
        self._lock = threading.Lock()

    def allow(self) -> Tuple[bool, float]:
        with self._lock:
            now = time.monotonic()
            if now < self.open_until:
                return False, max(0.0, self.open_until - now)
            return True, 0.0

    def record_success(self) -> None:
        with self._lock:
            self.failures = 0
            self.open_until = 0.0

    def record_failure(self) -> float:
        with self._lock:
            self.failures += 1
            if self.failures < CIRCUIT_THRESHOLD:
                return 0.0
            cool = min(CIRCUIT_MAX_COOL, CIRCUIT_BASE_COOL * (2 ** (self.failures - CIRCUIT_THRESHOLD)))
            self.open_until = time.monotonic() + cool
            return cool


class RateLimiter:
    def __init__(self, per_minute: int, burst: int) -> None:
        self.per_minute = per_minute
        self.burst = max(burst, per_minute)
        self._hits: Dict[str, Deque[float]] = {}
        self._lock = threading.Lock()

    def try_acquire(self, key: str, now: Optional[float] = None) -> Tuple[bool, float]:
        stamp = now or time.time()
        with self._lock:
            q = self._hits.setdefault(key, deque())
            cutoff = stamp - 60.0
            while q and q[0] < cutoff:
                q.popleft()
            if len(q) >= self.burst:
                # Burst window check fires first; callers should treat retry_in as a hard backoff before
                # re-evaluating the rolling per-minute quota.
                retry_in = max(0.0, q[0] + 60.0 - stamp)
                return False, retry_in
            if len(q) >= self.per_minute:
                idx = -self.per_minute
                retry_in = max(0.0, q[idx] + 60.0 - stamp)
                if retry_in > 0:
                    return False, retry_in
            q.append(stamp)
            return True, 0.0


_GLOBAL_RATE_LIMITER = RateLimiter(RATE_LIMIT_PER_MIN, RATE_LIMIT_BURST)
_GLOBAL_CONCURRENCY_SEMAPHORE = threading.BoundedSemaphore(MAX_CONCURRENT_REQUESTS)


def _check_payload_size(payload: Dict[str, Any]) -> None:
    try:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    except Exception as exc:
        raise NexusError("Failed to serialize payload", details={"error": str(exc)}) from exc
    if len(raw) > MAX_MODEL_REQUEST_BYTES:
        raise PayloadTooLargeError(
            f"Payload exceeds {MAX_MODEL_REQUEST_BYTES} bytes limit",
            details={"max_bytes": MAX_MODEL_REQUEST_BYTES, "observed_bytes": len(raw)},
        )


def _remaining_timeout(deadline: Optional[float], default: float) -> float:
    if deadline is None:
        return max(0.2, min(default, MAX_MODEL_TIMEOUT))
    remaining = max(0.0, deadline - time.monotonic())
    if remaining <= 0:
        raise DeadlineExceeded("No time remaining for request")
    return max(0.2, min(remaining, MAX_MODEL_TIMEOUT))


def _limit_body(stream: requests.Response, *, max_bytes: int) -> bytes:
    total = 0
    chunks: List[bytes] = []
    for chunk in stream.iter_content(chunk_size=65536):
        if not chunk:
            continue
        total += len(chunk)
        if total > max_bytes:
            stream.close()
            raise PayloadTooLargeError(
                f"Response exceeded {max_bytes} bytes",
                details={"max_bytes": max_bytes},
            )
        chunks.append(chunk)
    return b"".join(chunks)

# =========================================================
# ModelConnector + Adapters
# =========================================================
class ModelConnector:
    """HTTP connector with pluggable adapters to normalize request/response shapes."""
    _ADAPTERS: Dict[str, Callable[["ModelConnector", str, Optional[List[Dict[str, str]]], Optional[str], Optional[float]], Tuple[str, Dict[str, Any]]]] = {}
    _ALIASES: Dict[str, str] = {
        "mistral.chat": "openai.chat",
        "openrouter.chat": "openai.chat",
        "together.chat": "openai.chat",
        "groq.chat": "openai.chat",
        "deepseek.chat": "openai.chat",
        "perplexity.chat": "openai.chat",
        "pplx.chat": "openai.chat",
        "azure.openai.chat": "openai.chat",
        "github.models": "openai.chat",
    }

    def __init__(
        self,
        name: str,
        endpoint: str,
        headers: Optional[Dict[str, str]] = None,
        timeout: int = 12,
        max_retries: int = 3,
        adapter: str = "openai.chat",
        session: Optional[requests.Session] = None,
    ):
        self.name = name
        self.endpoint = endpoint
        self.headers = headers or {}
        self.timeout = min(float(timeout), MAX_MODEL_TIMEOUT)
        self.max_retries = int(max_retries)
        self.adapter = (adapter or "openai.chat").lower()
        self._session = session or requests.Session()
        self._circuit = _CircuitBreaker()

        # Security: enforce HTTPS (with localhost dev escape hatch) and optional domain allow-list
        if not _is_https_or_local(self.endpoint):
            raise ValueError(f"{name} endpoint must be HTTPS or explicit localhost in non-prod")
        parsed = urlparse(self.endpoint)
        host = (parsed.hostname or "").lower()
        env = os.getenv("NEXUS_ENV", "").lower()
        local_dev = parsed.scheme == "http" and host in {"127.0.0.1", "localhost"} and env not in {"prod", "production"}
        allow_env = os.getenv("NEXUS_ALLOWED_MODEL_DOMAINS", "").strip()
        allow = [s for s in (p.strip() for p in allow_env.split(",")) if s]
        allow_all = os.getenv("NEXUS_ALLOW_ALL_MODELS", "0").lower() in {"1", "true", "yes"}
        if not allow and not allow_all and not local_dev:
            raise MisconfigurationError("NEXUS_ALLOWED_MODEL_DOMAINS must be configured")
        if local_dev:
            log.warning(
                "connector_localhost_enabled",
                extra={"endpoint": self.endpoint, "env": os.getenv("NEXUS_ENV", "")},
            )
        if allow and not local_dev and not _host_allowed(self.endpoint, allow):
            raise MisconfigurationError(f"Endpoint host not allowed by NEXUS_ALLOWED_MODEL_DOMAINS: {self.endpoint}")

    @classmethod
    def register_adapter(
        cls,
        key: str,
        fn: Callable[["ModelConnector", str, Optional[List[Dict[str, str]]], Optional[str], Optional[float]], Tuple[str, Dict[str, Any]]],
    ) -> None:
        cls._ADAPTERS[key.lower()] = fn

    @classmethod
    def register_alias(cls, alias: str, target: str) -> None:
        cls._ALIASES[alias.lower()] = target.lower()

    def _resolve_adapter(self) -> str:
        a = (self.adapter or "").lower()
        return self._ALIASES.get(a, a)

    def _post(self, payload: Dict[str, Any], *, deadline: Optional[float] = None) -> Dict[str, Any]:
        allowed, wait_for = self._circuit.allow()
        if not allowed:
            raise CircuitOpenError(
                f"{self.name} circuit open, retry in {wait_for:.2f}s",
                details={"retry_after_seconds": round(wait_for, 3), "connector": self.name},
            )
        _check_payload_size(payload)
        last_err: Optional[Exception] = None
        for attempt in range(1, self.max_retries + 1):
            try:
                timeout = _remaining_timeout(deadline, self.timeout)
                resp = self._session.post(
                    self.endpoint,
                    json=payload,
                    headers=self.headers,
                    timeout=max(0.1, timeout),
                    stream=True,
                )
                if resp.status_code >= 400:
                    raise ConnectorError(
                        f"{self.name} HTTP {resp.status_code}",
                        details={"status_code": resp.status_code, "connector": self.name},
                    )
                declared = resp.headers.get("content-length")
                if declared and int(declared) > MAX_MODEL_RESPONSE_BYTES:
                    raise PayloadTooLargeError(
                        f"Response exceeds {MAX_MODEL_RESPONSE_BYTES} bytes limit",
                        details={"max_bytes": MAX_MODEL_RESPONSE_BYTES, "declared_bytes": int(declared)},
                    )
                body = _limit_body(resp, max_bytes=MAX_MODEL_RESPONSE_BYTES)
                text = body.decode(resp.encoding or "utf-8", errors="ignore")
                if resp.headers.get("content-type", "").lower().startswith("application/json"):
                    data = json.loads(text or "{}")
                else:
                    try:
                        data = json.loads(text)
                    except Exception:
                        data = {"text": text}
                self._circuit.record_success()
                return data
            except DeadlineExceeded as exc:
                last_err = exc
                self._circuit.record_failure()
                break
            except Exception as exc:
                last_err = exc
                cool = self._circuit.record_failure()
                if attempt == self.max_retries:
                    break
                wait = min(0.25 * attempt, 1.5)
                if cool:
                    wait = max(wait, min(cool, 5.0))
                time.sleep(wait)
        if isinstance(last_err, NexusError):
            raise last_err
        raise ConnectorError(
            f"{self.name} request failed after {self.max_retries} retries: {last_err}",
            details={
                "connector": self.name,
                "attempts": self.max_retries,
                "last_error": str(last_err) if last_err else None,
            },
        ) from last_err

    def health_check(self) -> bool:
        """Return True if degraded/unhealthy, False if healthy."""
        try:
            r = self._session.options(self.endpoint, headers=self.headers, timeout=min(self.timeout, 4))
            return r.status_code >= 400
        except Exception:
            return True

    def infer(
        self,
        prompt: str,
        *,
        history: Optional[List[Dict[str, str]]] = None,
        model_name: Optional[str] = None,
        deadline: Optional[float] = None,
    ) -> Tuple[str, Dict[str, Any]]:
        key = self._resolve_adapter()
        fn = self._ADAPTERS.get(key) or self._ADAPTERS.get("generic.json")
        bounded_history = _limit_history(history)
        return fn(self, prompt, bounded_history, model_name, deadline)  # (text, meta)

# ---- utilities for adapters ----
_ADAPTER_HISTORY_LIMIT = max(0, int(os.getenv("NEXUS_ADAPTER_HISTORY_LIMIT", "16")))


def _limit_history(history: Optional[List[Dict[str, str]]]) -> List[Dict[str, str]]:
    if not history:
        return []
    if _ADAPTER_HISTORY_LIMIT <= 0:
        source = history
    else:
        source = history[-_ADAPTER_HISTORY_LIMIT:]
    pruned: List[Dict[str, str]] = []
    for msg in source:
        if not isinstance(msg, dict):
            continue
        role = msg.get("role")
        content = msg.get("content")
        if isinstance(role, str) and isinstance(content, str):
            pruned.append({"role": role, "content": content})
    return pruned


def _first_str(d: Any, keys: Tuple[str, ...]) -> Optional[str]:
    if isinstance(d, dict):
        for k in keys:
            v = d.get(k)
            if isinstance(v, str) and v.strip():
                return v
    return None

# ---- adapters ----
def _adapt_openai_chat(self: ModelConnector, prompt, history, model_name, deadline=None):
    msgs = [{"role": m["role"], "content": m["content"]} for m in (history or []) if m.get("role") in {"system","user","assistant"} and "content" in m]
    msgs.append({"role":"user","content":prompt})
    payload = {"model": model_name or self.name, "messages": msgs, "temperature": 0.2}
    data = self._post(payload, deadline=deadline)
    text = ""
    try:
        text = data["choices"][0]["message"]["content"]
    except Exception:
        text = _first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_openai_responses(self: ModelConnector, prompt, history, model_name, deadline=None):
    payload = {"model": model_name or self.name, "input":[{"role":"user","content":[{"type":"text","text":prompt}]}]}
    data = self._post(payload, deadline=deadline)
    text = data.get("output_text") or _first_str(data, ("text","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_anthropic_messages(self: ModelConnector, prompt, history, model_name, deadline=None):
    msgs = [{"role": m["role"], "content": m["content"]} for m in (history or []) if m.get("role") in {"user","assistant"} and "content" in m]
    if not msgs or msgs[-1]["role"] != "user":
        msgs.append({"role":"user","content":prompt})
    payload = {"model": model_name or self.name, "messages": msgs, "max_tokens": 512, "temperature": 0.2}
    data = self._post(payload, deadline=deadline)
    parts = data.get("content")
    if isinstance(parts, list) and parts and isinstance(parts[0], dict) and "text" in parts[0]:
        text = parts[0]["text"]
    else:
        text = data.get("text") or _first_str(data, ("answer","completion","output","text")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_gemini_generate(self: ModelConnector, prompt, history, model_name, deadline=None):
    contents = [{"role":"user","parts":[{"text":prompt}]}]
    payload = {"model": model_name or self.name, "contents": contents, "generationConfig":{"temperature":0.2}}
    data = self._post(payload, deadline=deadline)
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        text = _first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_cohere_chat(self: ModelConnector, prompt, history, model_name, deadline=None):
    chat_hist=[]
    for m in (history or []):
        r,c=m.get("role"),m.get("content")
        if r in {"USER","user"}: chat_hist.append({"role":"USER","message":c})
        elif r in {"CHATBOT","assistant"}: chat_hist.append({"role":"CHATBOT","message":c})
    payload={"model":model_name or self.name,"message":prompt,"chat_history":chat_hist}
    data=self._post(payload, deadline=deadline)
    text=data.get("text") or data.get("reply") or data.get("answer") or json.dumps(data)[:1000]
    return text, {"usage": data.get("meta") or data.get("usage")}

def _adapt_cohere_generate(self: ModelConnector, prompt, history, model_name, deadline=None):
    payload={"model":model_name or self.name,"prompt":prompt}
    data=self._post(payload, deadline=deadline)
    try:
        text=data["generations"][0]["text"]
    except Exception:
        text=_first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("meta") or data.get("usage")}

def _adapt_tgi_generate(self: ModelConnector, prompt, history, model_name, deadline=None):
    payload={"inputs":prompt,"parameters":{"temperature":0.2}}
    data=self._post(payload, deadline=deadline)
    if isinstance(data, dict):
        text = data.get("generated_text") or _first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    elif isinstance(data, list) and data:
        text = data[0].get("generated_text") or json.dumps(data[0])[:1000]
    else:
        text = json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

def _adapt_generic_json(self: ModelConnector, prompt, history, model_name, deadline=None):
    payload={"model":model_name or self.name,"prompt":prompt,"history":history or []}
    data=self._post(payload, deadline=deadline)
    text=_first_str(data, ("text","output","answer","completion")) or json.dumps(data)[:1000]
    return text, {"usage": data.get("usage")}

ModelConnector.register_adapter("openai.chat", _adapt_openai_chat)
ModelConnector.register_adapter("openai.responses", _adapt_openai_responses)
ModelConnector.register_adapter("anthropic.messages", _adapt_anthropic_messages)
ModelConnector.register_adapter("gemini.generate", _adapt_gemini_generate)
ModelConnector.register_adapter("cohere.chat", _adapt_cohere_chat)
ModelConnector.register_adapter("cohere.generate", _adapt_cohere_generate)
ModelConnector.register_adapter("tgi.generate", _adapt_tgi_generate)
ModelConnector.register_adapter("generic.json", _adapt_generic_json)

# =========================================================
# Web retrieval (+ BeautifulSoup enrichment with retries)
# =========================================================
@dataclass
class WebSource:
    url: str
    title: Optional[str] = None
    snippet: Optional[str] = None
    image: Optional[str] = None
    score: Optional[float] = None

class SearchProvider:
    name: str = "base"
    def search(self, query: str, *, k: int = 5, images: bool = False, deadline: Optional[float] = None) -> List[WebSource]:
        raise NotImplementedError

class _BaseHTTPProvider(SearchProvider):
    def __init__(self, timeout: int = 10, session: Optional[requests.Session] = None):
        self.timeout = int(timeout)
        self._session = session or requests.Session()

class GenericJSONSearch(_BaseHTTPProvider):
    name = "generic.json"
    def __init__(self, endpoint: str, headers: Optional[Dict[str,str]] = None, timeout: int = 10, session: Optional[requests.Session] = None):
        super().__init__(timeout=timeout, session=session)
        if not _is_https_or_local(endpoint):
            raise ValueError("Search endpoint must be HTTPS or explicit localhost in non-prod")
        self.endpoint, self.headers = endpoint, (headers or {})
        parsed = urlparse(endpoint)
        host = (parsed.hostname or "").lower()
        env = os.getenv("NEXUS_ENV", "").lower()
        if parsed.scheme == "http" and host in {"127.0.0.1", "localhost"} and env not in {"prod", "production"}:
            log.warning(
                "search_localhost_enabled",
                extra={"endpoint": endpoint, "env": os.getenv("NEXUS_ENV", "")},
            )
    def search(self, query: str, *, k: int = 5, images: bool = False, deadline: Optional[float] = None) -> List[WebSource]:
        def _do():
            timeout = _remaining_timeout(deadline, self.timeout)
            r = self._session.post(
                self.endpoint,
                json={"q": query, "k": int(k), "images": bool(images)},
                headers=self.headers,
                timeout=max(0.1, timeout),
            )
            r.raise_for_status(); return r
        try:
            r = _retry_call(_do)
        except DeadlineExceeded:
            return []
        data = r.json() if r.headers.get("content-type","").startswith("application/json") else {}
        out=[]
        for it in data.get("results", []):
            u = it.get("url")
            if isinstance(u, str) and _is_https(u):
                out.append(WebSource(url=u, title=it.get("title"), snippet=it.get("snippet"),
                                     image=(it.get("image") if images else None), score=it.get("score")))
        return out[:k]

class TavilySearch(_BaseHTTPProvider):
    name = "tavily"
    def __init__(self, api_key: str, timeout: int = 10, session: Optional[requests.Session] = None):
        super().__init__(timeout=timeout, session=session)
        self.api_key = api_key
    def search(self, query: str, *, k: int = 5, images: bool = False, deadline: Optional[float] = None) -> List[WebSource]:
        url = "https://api.tavily.com/search"
        payload = {"api_key": self.api_key, "query": query, "max_results": int(k), "include_images": bool(images)}
        def _do():
            timeout = _remaining_timeout(deadline, self.timeout)
            r = self._session.post(url, json=payload, timeout=max(0.1, timeout))
            r.raise_for_status(); return r
        try:
            r = _retry_call(_do)
        except DeadlineExceeded:
            return []
        data = r.json(); out=[]
        for it in data.get("results", []):
            u = it.get("url")
            if isinstance(u, str) and _is_https(u):
                out.append(WebSource(url=u, title=it.get("title"), snippet=it.get("content"), image=it.get("image")))
        return out[:k]

class BingWebSearch(_BaseHTTPProvider):
    name = "bing"
    def __init__(self, api_key: str, timeout: int = 10, session: Optional[requests.Session] = None):
        super().__init__(timeout=timeout, session=session)
        self.api_key = api_key
    def search(self, query: str, *, k: int = 5, images: bool = False, deadline: Optional[float] = None) -> List[WebSource]:
        def _do_web():
            timeout = _remaining_timeout(deadline, self.timeout)
            url = f"https://api.bing.microsoft.com/v7.0/search?q={requests.utils.quote(query)}&count={int(k)}"
            r = self._session.get(
                url,
                headers={"Ocp-Apim-Subscription-Key": self.api_key},
                timeout=max(0.1, timeout),
            )
            r.raise_for_status(); return r
        try:
            r = _retry_call(_do_web)
        except DeadlineExceeded:
            return []
        data = r.json()
        items = (data.get("webPages") or {}).get("value", []); out=[]
        for it in items:
            u = it.get("url")
            if isinstance(u, str) and _is_https(u):
                out.append(WebSource(url=u, title=it.get("name"), snippet=it.get("snippet")))
        if images:
            def _do_img():
                timeout = _remaining_timeout(deadline, self.timeout)
                iu = f"https://api.bing.microsoft.com/v7.0/images/search?q={requests.utils.quote(query)}&count={int(k)}"
                ir = self._session.get(
                    iu,
                    headers={"Ocp-Apim-Subscription-Key": self.api_key},
                    timeout=max(0.1, timeout),
                )
                ir.raise_for_status(); return ir
            try:
                ir = _retry_call(_do_img)
            except DeadlineExceeded:
                return out
            idata = ir.json()
            for i in (idata.get("value") or [])[:k]:
                cu = i.get("contentUrl"); hp = i.get("hostPageUrl")
                if isinstance(cu, str) and _is_https(cu) and isinstance(hp, str) and _is_https(hp):
                    out.append(WebSource(url=hp, title=i.get("name"), image=cu))
        return out[:max(k, len(out))]

class GoogleCSESearch(_BaseHTTPProvider):
    name = "google.cse"
    def __init__(self, api_key: str, cx: str, timeout: int = 10, session: Optional[requests.Session] = None):
        super().__init__(timeout=timeout, session=session)
        self.key, self.cx = api_key, cx
    def search(self, query: str, *, k: int = 5, images: bool = False, deadline: Optional[float] = None) -> List[WebSource]:
        base = "https://www.googleapis.com/customsearch/v1"
        def _do_search():
            timeout = _remaining_timeout(deadline, self.timeout)
            params = {"key": self.key, "cx": self.cx, "q": query, "num": int(min(10, k))}
            r = self._session.get(base, params=params, timeout=max(0.1, timeout)); r.raise_for_status(); return r
        try:
            r = _retry_call(_do_search)
        except DeadlineExceeded:
            return []
        data = r.json(); out=[]
        for it in data.get("items", [])[:k]:
            link = it.get("link")
            if isinstance(link, str) and _is_https(link):
                out.append(WebSource(url=link, title=it.get("title"), snippet=it.get("snippet")))
        if images:
            def _do_img():
                timeout = _remaining_timeout(deadline, self.timeout)
                params_img = {"key": self.key, "cx": self.cx, "q": query, "searchType":"image", "num": int(min(10, k))}
                ir = self._session.get(base, params=params_img, timeout=max(0.1, timeout)); ir.raise_for_status(); return ir
            try:
                ir = _retry_call(_do_img)
            except DeadlineExceeded:
                return out
            idata = ir.json()
            for i in idata.get("items", [])[:k]:
                link = (i.get("image", {}) or {}).get("contextLink") or i.get("link")
                if isinstance(link, str) and _is_https(link):
                    out.append(WebSource(url=link, title=i.get("title"), image=i.get("link")))
        return out[:max(k, len(out))]

class DuckDuckGoHTMLSearch(_BaseHTTPProvider):
    name = "duckduckgo.html"
    UA = "Mozilla/5.0 (X11; Linux x86_64) NexusEngine/1.0"
    def search(self, query: str, *, k: int = 5, images: bool = False, deadline: Optional[float] = None) -> List[WebSource]:
        def _do():
            timeout = _remaining_timeout(deadline, self.timeout)
            url = f"https://duckduckgo.com/html/?q={quote_plus(query)}"
            r = self._session.get(
                url,
                headers={"User-Agent": self.UA},
                timeout=max(0.1, timeout),
                stream=True,
            )
            r.raise_for_status(); return r
        try:
            r = _retry_call(_do)
        except DeadlineExceeded:
            return []
        body = _limit_body(r, max_bytes=MAX_SCRAPE_BYTES)
        soup = BeautifulSoup(body.decode(r.encoding or "utf-8", errors="ignore"), "html.parser")
        out: List[WebSource] = []
        for res in soup.select("div.result"):
            a = res.select_one("a.result__a") or res.find("a", attrs={"class": lambda c: c and "result__a" in c})
            if not a or not a.get("href"):
                continue
            href = a.get("href")
            if not isinstance(href, str) or not href.startswith("http"):
                continue
            if not _is_https(href):
                continue
            title = a.get_text(" ", strip=True)
            sn = res.select_one("a.result__snippet") or res.select_one("div.result__snippet")
            snippet = sn.get_text(" ", strip=True) if sn else None
            out.append(WebSource(url=href, title=title, snippet=snippet))
            if len(out) >= k:
                break
        return out

class HtmlScraper:
    UA = "Mozilla/5.0 (X11; Linux x86_64) NexusEngine/1.0"

    def __init__(self, timeout: int = 8, session: Optional[requests.Session] = None):
        self.timeout = min(float(timeout), MAX_MODEL_TIMEOUT)
        self._session = session or requests.Session()

    def enrich(self, src: WebSource, *, deadline: Optional[float] = None) -> WebSource:
        if _host_blocked(src.url, _SCRAPE_DENYLIST):
            return src
        if _SCRAPE_ALLOWLIST and not _host_allowed(src.url, _SCRAPE_ALLOWLIST):
            return src

        if _RESPECT_ROBOTS:
            try:
                parsed = urlparse(src.url)
                base = f"{parsed.scheme}://{parsed.netloc}"
                robots = self._session.get(
                    f"{base}/robots.txt",
                    headers={"User-Agent": self.UA},
                    timeout=2,
                )
                # TODO: replace this coarse check with a full robots.txt parser once
                # deployment includes centralised crawl governance.
                if robots.ok and "Disallow: /" in robots.text:
                    return src
            except Exception:
                pass

        def _do():
            timeout = _remaining_timeout(deadline, self.timeout)
            return self._session.get(
                src.url,
                headers={"User-Agent": self.UA},
                timeout=max(0.1, timeout),
                stream=True,
            )

        try:
            r = _retry_call(_do)
            if not r.ok:
                return src
            declared = r.headers.get("content-length")
            if declared and int(declared) > MAX_SCRAPE_BYTES:
                raise PayloadTooLargeError(
                    "Scrape body too large",
                    details={"max_bytes": MAX_SCRAPE_BYTES},
                )
            body = _limit_body(r, max_bytes=MAX_SCRAPE_BYTES)
            text = body.decode(r.encoding or "utf-8", errors="ignore")
            soup = BeautifulSoup(text, "html.parser")
            for tag in soup.find_all(["script", "style", "noscript", "iframe", "form", "object"]):
                tag.decompose()
            for tag in soup.find_all(True):
                for attr in list(tag.attrs.keys()):
                    if isinstance(attr, str) and attr.lower().startswith("on"):
                        del tag.attrs[attr]
            title = src.title or (soup.title.get_text(strip=True) if soup.title else None)
            meta_desc = soup.find("meta", attrs={"name":"description"}) or soup.find("meta", attrs={"property":"og:description"})
            desc = src.snippet or (meta_desc.get("content").strip() if meta_desc and meta_desc.get("content") else None)
            if not desc:
                paragraphs = soup.find_all("p")
                for p in paragraphs:
                    candidate = p.get_text(" ", strip=True)
                    if candidate:
                        desc = candidate
                        break
            desc = _sanitize(desc)
            title = _sanitize(title)
            og_img = (
                soup.find("meta", attrs={"property":"og:image"})
                or soup.find("meta", attrs={"name":"og:image"})
                or soup.find("meta", attrs={"name":"twitter:image"})
            )
            if og_img and og_img.get("content"):
                image_candidate = urljoin(src.url, og_img.get("content"))
            else:
                image_candidate = None
            image = src.image or image_candidate
            return WebSource(url=src.url, title=title, snippet=desc, image=image, score=src.score)
        except DeadlineExceeded:
            return src
        except Exception:
            return src

class WebRetriever:
    def __init__(self, providers: List[SearchProvider], scraper: Optional[HtmlScraper] = None):
        if not providers:
            raise MisconfigurationError("At least one search provider is required")
        env = os.getenv("NEXUS_ENV", "").lower()
        if env in {"prod", "production"} and not _SCRAPE_ALLOWLIST:
            raise MisconfigurationError("In production, NEXUS_SCRAPE_ALLOW_DOMAINS must be configured")
        self.providers = providers
        self.scraper = scraper

    def search_all(
        self,
        query: str,
        *,
        k_per_provider: int = 5,
        want_images: bool = False,
        max_total: int = 12,
        deadline: Optional[float] = None,
        request_id: Optional[str] = None,
    ) -> List[WebSource]:
        results: List[WebSource] = []
        if not self.providers:
            return results
        with ThreadPoolExecutor(max_workers=min(8, len(self.providers))) as pool:
            futs = []
            for p in self.providers:
                if deadline and time.monotonic() >= deadline:
                    break
                futs.append(pool.submit(p.search, query, k=k_per_provider, images=want_images, deadline=deadline))
            for f in as_completed(futs):
                try:
                    chunk = f.result() or []
                    for item in chunk:
                        if not isinstance(item, WebSource) or not item.url:
                            continue
                        if _host_blocked(item.url, _SCRAPE_DENYLIST):
                            continue
                        if _SCRAPE_ALLOWLIST and not _host_allowed(item.url, _SCRAPE_ALLOWLIST):
                            continue
                        results.append(item)
                except Exception as e:
                    log.warning(
                        "search_provider_failed",
                        extra={"request_id": request_id, "error": str(e)},
                    )
        uniq: List[WebSource] = []
        seen = set()
        for s in results:
            if s.url in seen or _host_blocked(s.url, _SCRAPE_DENYLIST):
                continue
            if _SCRAPE_ALLOWLIST and not _host_allowed(s.url, _SCRAPE_ALLOWLIST):
                continue
            seen.add(s.url)
            if self.scraper:
                try:
                    enriched = self.scraper.enrich(s, deadline=deadline)
                except Exception:
                    enriched = s
                uniq.append(enriched)
            else:
                uniq.append(s)
            if len(uniq) >= max_total:
                break
        return uniq[:max_total]

# =========================================================
# Result policies
# =========================================================
class ResultPolicy:
    name: str = "base"
    def aggregate(self, prompt: str, *, answers: Dict[str, str], latencies: Dict[str, float],
                  errors: Dict[str, str], metas: Dict[str, Dict[str, Any]],
                  context: Optional[List[Dict[str, str]]] = None, params: Optional[Dict[str, Any]] = None
                  ) -> Dict[str, Any]:
        raise NotImplementedError

class FastestPolicy(ResultPolicy):
    name = "fastest"
    def aggregate(self, prompt, *, answers, latencies, errors, metas, context=None, params=None):
        if not answers: return {"result":"", "winner":None, "policy":self.name, "reason":"no answer"}
        winner = min(answers.keys(), key=lambda k: latencies.get(k, 9e9))
        return {"result": answers[winner], "winner": winner, "policy": self.name}

class ConsensusSimplePolicy(ResultPolicy):
    name = "consensus.simple"
    @staticmethod
    def _tokset(s: str) -> set: return set((s or "").lower().split())
    @staticmethod
    def _jac(a: set, b: set) -> float:
        if not a and not b: return 0.0
        return len(a & b) / float(len(a | b) or 1)
    def aggregate(self, prompt, *, answers, latencies, errors, metas, context=None, params=None):
        if not answers: return {"result":"", "winner":None, "policy":self.name, "reason":"no answer"}
        toks = {k: self._tokset(v) for k, v in answers.items()}
        scores = {}
        for k in answers.keys():
            other_keys = [o for o in toks.keys() if o != k]
            jac_vals = [self._jac(toks[k], toks[o]) for o in other_keys]
            bm25_vals = _bm25_scores(answers[k], [answers[o] for o in other_keys]) if other_keys else []
            jac_score = sum(jac_vals) / len(jac_vals) if jac_vals else 0.0
            bm25_score = sum(bm25_vals) / len(bm25_vals) if bm25_vals else 0.0
            scores[k] = 0.6 * jac_score + 0.4 * bm25_score
        winner = max(scores, key=scores.get)
        return {"result": answers[winner], "winner": winner, "policy": self.name}


class ConsensusWeightedPolicy(ResultPolicy):
    """Consensus policy that blends similarity, verbosity, and latency heuristics."""

    name = "consensus.weighted"

    @staticmethod
    def _tokens(text: str) -> List[str]:
        return [t for t in re.findall(r"[A-Za-z0-9_]+", (text or "").lower()) if t not in _STOP]

    @staticmethod
    def _similarity(a: List[str], b: List[str]) -> float:
        if not a or not b:
            return 0.0
        sa, sb = set(a), set(b)
        inter = len(sa & sb)
        union = len(sa | sb) or 1
        jaccard = inter / union
        len_ratio = 1.0 - abs(len(a) - len(b)) / float(max(len(a), len(b)) or 1)
        return 0.85 * jaccard + 0.15 * max(0.0, len_ratio)

    def aggregate(self, prompt, *, answers, latencies, errors, metas, context=None, params=None):
        if not answers:
            return {"result": "", "winner": None, "policy": self.name, "reason": "no answer"}

        tokens = {name: self._tokens(text) for name, text in answers.items()}

        scores: Dict[str, float] = {}
        for name, toks in tokens.items():
            peers = [self._similarity(toks, tokens[peer]) for peer in tokens.keys() if peer != name]
            consensus = sum(peers) / len(peers) if peers else 0.0
            length_bonus = min(len(toks) / 400.0, 0.05)
            latency = latencies.get(name)
            latency_bonus = 0.0
            if isinstance(latency, (int, float)) and latency > 0:
                latency_bonus = min(0.1, 0.05 + 0.5 / (1.0 + latency))
            scores[name] = consensus + length_bonus + latency_bonus

        winner = max(scores, key=scores.get)
        return {"result": answers[winner], "winner": winner, "policy": self.name, "scores": scores}

_POLICIES: Dict[str, ResultPolicy] = {
    FastestPolicy.name: FastestPolicy(),
    ConsensusSimplePolicy.name: ConsensusSimplePolicy(),
    ConsensusWeightedPolicy.name: ConsensusWeightedPolicy(),
}
def get_policy(name: Optional[str]) -> ResultPolicy:
    return _POLICIES.get((name or "").lower(), _POLICIES["consensus.simple"])

# =========================================================
# Config + helpers (IR scoring, domain boosts)
# =========================================================
@dataclass
class EngineConfig:
    """Runtime knobs for the Nexus engine.

    default_deadline_ms is expressed in **milliseconds** to align with adapter and
    gateway level time budgets. Keeping the unit explicit here helps avoid
    accidental second/millisecond mixups when callers propagate request
    deadlines through the system.
    """

    max_context_messages: int = 8
    max_parallel: Optional[int] = None
    default_policy: str = os.getenv("NEXUS_RESULT_POLICY", "consensus.simple")
    min_sources_required: int = max(1, int(os.getenv("NEXUS_MIN_SOURCES", "2")))
    search_k_per_provider: int = 5
    search_max_total: int = 12
    scrape_timeout: int = 8
    default_deadline_ms: Optional[int] = (
        int(os.getenv("NEXUS_DEFAULT_DEADLINE_MS")) if os.getenv("NEXUS_DEFAULT_DEADLINE_MS") else None
    )

_CODE_RE = re.compile(
    r"```(?P<lang>[a-zA-Z0-9_\-+. ]*)\r?\n(?P<body>[\s\S]*?)```",
    re.MULTILINE,
)

def _extract_code_blocks(text: str) -> List[Dict[str, str]]:
    blocks: List[Dict[str, str]] = []
    for m in _CODE_RE.finditer(text or ""):
        lang = (m.group("lang") or "").strip() or None
        body = (m.group("body") or "").strip()
        if body: blocks.append({"language": lang, "code": body})
    return blocks

_STOP = set("""
a an the and or but if while then of in on for with without about across against between into through during before after above below to from up down under over again further
is are was were be been being do does did doing have has had having i you he she it we they them me my your our their this that these those as at by can could should would will may might
""".split())

def _tokenize(s: str) -> List[str]:
    return re.findall(r"[A-Za-z0-9_]{3,}", (s or "").lower())

def _keywords(s: str, k: int = 24) -> List[str]:
    toks = [t for t in _tokenize(s) if t not in _STOP]
    seen, out = set(), []
    for t in toks:
        if t not in seen:
            seen.add(t); out.append(t)
        if len(out) >= k:
            break
    return out


def _sanitize(txt: Optional[str]) -> Optional[str]:
    if not txt:
        return txt
    bad_phrases = [
        "ignore previous instructions",
        "disregard prior",
        "override system prompt",
        "ignore all prior instructions",
        "disregard above",
    ]
    lower = txt.lower()
    if any(phrase in lower for phrase in bad_phrases):
        pattern = "|".join(re.escape(p) for p in bad_phrases)
        return re.sub(pattern, "[redacted]", txt, flags=re.IGNORECASE)
    return txt


def _bm25_scores(answer_text: str, docs: List[str], *, k1: float = 1.2, b: float = 0.75) -> List[float]:
    q_terms = [t for t in _tokenize(answer_text) if t not in _STOP]
    if not q_terms:
        return [0.0] * len(docs)
    q_set = set(q_terms)

    tok_docs: List[List[str]] = [[t for t in _tokenize(d) if t not in _STOP] for d in docs]
    doc_lens = [len(toks) for toks in tok_docs]
    avgdl = (sum(doc_lens) / float(len(doc_lens))) if doc_lens else 1.0

    df: Dict[str, int] = {t: 0 for t in q_set}
    for toks in tok_docs:
        present = set(toks)
        for t in q_set:
            if t in present:
                df[t] += 1
    N = max(1, len(tok_docs))

    idf: Dict[str, float] = {}
    for t in q_set:
        n = df.get(t, 0)
        idf[t] = math.log((N - n + 0.5) / (n + 0.5) + 1.0)

    scores: List[float] = []
    for toks, dl in zip(tok_docs, doc_lens):
        tf = Counter(toks)
        s = 0.0
        for t in q_set:
            f = tf.get(t, 0)
            if f == 0:
                continue
            denom = f + k1 * (1 - b + b * (dl / (avgdl or 1.0)))
            s += idf[t] * ((f * (k1 + 1)) / (denom or 1.0))
        scores.append(s)
    return scores

def _load_domain_boosts() -> Dict[str, float]:
    raw = os.getenv("NEXUS_DOMAIN_BOOSTS", "").strip()
    if not raw:
        return {
            "who.int": 1.30, "cdc.gov": 1.30, "nih.gov": 1.30,
            "nasa.gov": 1.20, "nature.com": 1.20, "sciencedirect.com": 1.15,
            "arxiv.org": 1.12, "wikipedia.org": 1.10, "bbc.co.uk": 1.08,
            "nytimes.com": 1.05, "ft.com": 1.05
        }
    try:
        if raw.startswith("{"):
            return {str(k).lower(): float(v) for k, v in json.loads(raw).items()}
        out: Dict[str, float] = {}
        for pair in raw.split(";"):
            if not pair.strip(): continue
            dom, mult = pair.split("=", 1)
            out[dom.strip().lower()] = float(mult.strip())
        return out
    except Exception:
        return {}

_DOMAIN_BOOSTS = _load_domain_boosts()

def _host_of(url: str) -> Optional[str]:
    try:
        return urlparse(url).netloc.lower()
    except Exception:
        return None


def _base_domain(host: str) -> str:
    parts = host.split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else host


def _boost_for(url: str) -> float:
    h = _host_of(url) or ""
    base = _base_domain(h) if h else ""
    if base and base in _DOMAIN_BOOSTS:
        return _DOMAIN_BOOSTS[base]
    if h in _DOMAIN_BOOSTS:
        return _DOMAIN_BOOSTS[h]
    return 1.0

def _evidence_score(answer_text: str, title: Optional[str], snippet: Optional[str]) -> float:
    doc = f"{title or ''} {snippet or ''}".strip()
    if not doc:
        return 0.0
    bm25 = _bm25_scores(answer_text, [doc])[0]
    keys = _keywords(answer_text)
    hay = doc.lower()
    overlap = sum(1 for k in keys if k in hay) / float(max(1, len(keys)))
    return bm25 + 0.1 * overlap

# =========================================================
# Engine — strict schema + verified sources + isolation/encryption (MANDATORY AES)
# =========================================================
class Engine:
    """
    Returns payload with ALL non-optional keys (schema fixed; do not modify):
      {
        "answer": str,
        "winner": str,
        "winner_ref": { "name": str, "adapter": str, "endpoint": str },
        "participants": [str, ...],
        "code": [ {language, code}, ... ],
        "sources": [ {url, title, snippet}, ... ],  # verified ≥ min_sources_required
        "photos": [ {url, caption}, ... ],
        "meta": { "schema_version": str, ... }
      }
    """
    SCHEMA_VERSION: str = ENGINE_SCHEMA_VERSION

    def __init__(self, connectors: Dict[str, ModelConnector], *,
                 memory,
                 web: WebRetriever,
                 access: AccessContext,
                 crypter: Crypter,
                 config: Optional[EngineConfig] = None):
        self.schema_version = ENGINE_SCHEMA_VERSION
        # Encryption is MANDATORY — crypter and access are required.
        if not connectors:
            raise MisconfigurationError("No connectors configured.")
        if web is None:
            raise MisconfigurationError("WebRetriever is required (verification sources are mandatory).")
        if not isinstance(access, AccessContext):
            raise MisconfigurationError("AccessContext is required (tenant/instance/user scoping).")
        if not isinstance(crypter, Crypter):
            raise MisconfigurationError("Crypter is required (AES-256-GCM).")

        self.connectors = connectors
        self.memory = memory
        self.web = web
        self.config = config or EngineConfig()
        self.access = access
        self.crypter = crypter

        if self.config.max_parallel is None:
            self.config.max_parallel = min(16, max(1, len(connectors)))
        if web.scraper is None:
            web.scraper = HtmlScraper(timeout=self.config.scrape_timeout)
        self.scraper = web.scraper

        # Health monitor (autostart unless disabled)
        self._health_monitor: Optional[HealthMonitor] = None
        auto_health = os.getenv("NEXUS_HEALTH_AUTORUN")
        if auto_health and auto_health.lower() in {"1", "true", "yes"}:
            interval = int(os.getenv("NEXUS_HEALTH_INTERVAL_SEC", "3600"))
            self.start_health_monitor(interval_seconds=interval)

    # ---- isolation helpers ----
    def _scoped_session(self, session_id: str) -> str:
        return f"{self.access.tenant_id}:{self.access.instance_id}:{self.access.user_id}:{session_id}"

    def _aad(self, session_id: str) -> bytes:
        return f"{self.access.tenant_id}|{self.access.instance_id}|{self.access.user_id}|{session_id}".encode("utf-8")

    def _save_mem(self, session_id: str, role: str, text: str, meta: Optional[Dict[str, Any]] = None):
        if not self.memory:
            return
        sid = self._scoped_session(session_id)
        meta = dict(meta or {})
        meta.update({
            "nexus_scope": {
                "tenant": self.access.tenant_id,
                "instance": self.access.instance_id,
                "user": self.access.user_id,
            },
            "enc": "aesgcm",  # always encrypted
        })
        payload = self.crypter.encrypt(text, aad=self._aad(session_id))
        try:
            self.memory.save(sid, role, payload, meta)
        except Exception:
            log.warning("memory save failed", exc_info=True)

    # ---- context/history ----
    def _history_for(self, session_id: str) -> List[Dict[str, str]]:
        try:
            if not self.memory:
                return []
            sid = self._scoped_session(session_id)
            msgs = self.memory.recent(sid, limit=self.config.max_context_messages) or []
            out: List[Dict[str, str]] = []
            for m in msgs:
                r = m.get("role"); t = m.get("text")
                if r not in {"system","user","assistant"} or not isinstance(t, str):
                    continue
                # Always decrypt; if decrypt fails, skip the message (strict encrypted-only policy)
                try:
                    t = self.crypter.decrypt(t, aad=self._aad(session_id))
                except Exception:
                    continue
                out.append({"role": r, "content": t})
            return out
        except Exception:
            return []

    # ---- health monitor control ----
    def start_health_monitor(self, interval_seconds: int = 3600) -> None:
        if self._health_monitor and self._health_monitor.is_running:
            return
        self._health_monitor = HealthMonitor(
            self,
            interval_seconds=interval_seconds,
            autostart=False,
        )
        self._health_monitor.start()

    def stop_health_monitor(self) -> None:
        if self._health_monitor:
            self._health_monitor.stop()
            self._health_monitor = None

    def close(self) -> None:
        """Release background resources (health monitor and HTTP sessions)."""
        self.stop_health_monitor()
        for connector in self.connectors.values():
            session = getattr(connector, "_session", None)
            if session and hasattr(session, "close"):
                try:
                    session.close()
                except Exception:
                    pass
        if getattr(self.web, "providers", None):
            for provider in self.web.providers:
                session = getattr(provider, "_session", None)
                if session and hasattr(session, "close"):
                    try:
                        session.close()
                    except Exception:
                        pass
        scraper_session = getattr(getattr(self.web, "scraper", None), "_session", None)
        if scraper_session and hasattr(scraper_session, "close"):
            try:
                scraper_session.close()
            except Exception:
                pass

    def health_snapshot(self) -> Dict[str, Any]:
        if self._health_monitor:
            return self._health_monitor.snapshot()
        mon = HealthMonitor(self, interval_seconds=10, autostart=False)
        return mon.run_once()

    def run_health_check_once(self) -> Dict[str, Any]:
        if self._health_monitor:
            return self._health_monitor.run_once()
        return self.health_snapshot()

    # ---- core infer ----
    def _infer_one(
        self,
        name: str,
        conn: ModelConnector,
        prompt: str,
        history: List[Dict[str, str]],
        *,
        deadline: Optional[float],
        request_id: str,
        session_id: str,
    ) -> Tuple[str, str, float]:
        t0 = time.time()
        try:
            if history:
                if self.config.max_context_messages:
                    bounded_history = history[-self.config.max_context_messages:]
                else:
                    bounded_history = list(history)
            else:
                bounded_history = []
            text, _meta = conn.infer(prompt, history=bounded_history, model_name=name, deadline=deadline)
            if isinstance(text, str) and not text.strip():
                text = ""
            return name, text, round(time.time()-t0, 3)
        except NexusError as exc:
            log.warning(
                "connector_failed",
                extra={"request_id": request_id, "session_id": session_id, "connector": name, "error": str(exc)},
            )
            return name, "", round(time.time()-t0, 3)
        except Exception as exc:
            log.warning(
                "connector_exception",
                extra={"request_id": request_id, "connector": name, "error": str(exc)},
            )
            return name, "", round(time.time()-t0, 3)

    def _collect_sources(
        self,
        queries: List[str],
        *,
        want_images: bool,
        k_per_provider: int,
        max_total: int,
        deadline: Optional[float],
        request_id: str,
    ) -> List[WebSource]:
        results: List[WebSource] = []
        seen = set()
        for q in queries:
            if len(results) >= max_total:
                break
            if deadline and time.monotonic() >= deadline:
                break
            try:
                batch = self.web.search_all(
                    q,
                    k_per_provider=k_per_provider,
                    want_images=want_images,
                    max_total=max_total,
                    deadline=deadline,
                    request_id=request_id,
                )
                for s in batch:
                    if s.url in seen:
                        continue
                    if _host_blocked(s.url, _SCRAPE_DENYLIST):
                        continue
                    if _SCRAPE_ALLOWLIST and not _host_allowed(s.url, _SCRAPE_ALLOWLIST):
                        continue
                    results.append(s)
                    seen.add(s.url)
                    if len(results) >= max_total:
                        break
            except DeadlineExceeded:
                break
            except Exception as e:
                log.warning(
                    "web_search_failed",
                    extra={"request_id": request_id, "error": str(e)},
                )
        return results[:max_total]

    def _rank_and_verify(self, answer_text: str, sources: List[WebSource], need: int) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        scored: List[Tuple[float, WebSource]] = []
        for s in sources:
            base = _evidence_score(answer_text, s.title, s.snippet)
            boosted = base * _boost_for(s.url)
            scored.append((boosted, s))
        scored.sort(key=lambda x: x[0], reverse=True)

        web_refs: List[Dict[str, Any]] = []
        photos: List[Dict[str, Any]] = []
        host_seen = set()
        backlog: List[WebSource] = []
        for _, s in scored:
            if not (s.url and (s.title or s.snippet)):
                continue
            if _host_blocked(s.url, _SCRAPE_DENYLIST):
                continue
            if _SCRAPE_ALLOWLIST and not _host_allowed(s.url, _SCRAPE_ALLOWLIST):
                continue
            host = _host_of(s.url)
            entry = {"url": s.url, "title": s.title, "snippet": s.snippet}
            if host and host not in host_seen:
                web_refs.append(entry)
                host_seen.add(host)
                if s.image:
                    photos.append({"url": s.image, "caption": s.title})
            else:
                backlog.append(s)
            if len(web_refs) >= need:
                break
        if len(web_refs) < need:
            for s in backlog:
                if not (s.url and (s.title or s.snippet)):
                    continue
                if _host_blocked(s.url, _SCRAPE_DENYLIST):
                    continue
                if _SCRAPE_ALLOWLIST and not _host_allowed(s.url, _SCRAPE_ALLOWLIST):
                    continue
                web_refs.append({"url": s.url, "title": s.title, "snippet": s.snippet})
                if s.image:
                    photos.append({"url": s.image, "caption": s.title})
                if len(web_refs) >= need:
                    break
        return web_refs, photos

    def run(
        self,
        session_id: str,
        query: str,
        *,
        policy_name: Optional[str] = None,
        want_photos: bool = False,
        deadline_ms: Optional[int] = None,
    ) -> Dict[str, Any]:

        request_id = uuid.uuid4().hex[:12]
        if not _GLOBAL_CONCURRENCY_SEMAPHORE.acquire(timeout=CONCURRENCY_WAIT_SECONDS):
            raise RateLimitExceeded(
                "Engine is at capacity; please retry shortly.",
                details={"retry_after_seconds": CONCURRENCY_WAIT_SECONDS},
            )

        scope_key = f"{self.access.tenant_id}:{self.access.instance_id}:{self.access.user_id}"
        allowed, retry_in = _GLOBAL_RATE_LIMITER.try_acquire(scope_key)
        if not allowed:
            _GLOBAL_CONCURRENCY_SEMAPHORE.release()
            raise RateLimitExceeded(
                f"Rate limit exceeded. Retry in {retry_in:.2f}s",
                details={"retry_after_seconds": round(retry_in, 3)},
            )

        effective_deadline_ms = deadline_ms if deadline_ms is not None else self.config.default_deadline_ms
        if effective_deadline_ms is not None:
            effective_deadline_ms = min(effective_deadline_ms, MAX_DEADLINE_SECONDS * 1000)
            deadline = time.monotonic() + (effective_deadline_ms / 1000.0)
        else:
            deadline = None

        log.info("engine_run_start", extra={"request_id": request_id, "session_id": session_id})

        try:
            # Save user query (scoped + encrypted)
            self._save_mem(session_id, "user", query, {"ephemeral": False})

            history = self._history_for(session_id)
            participants = list(self.connectors.keys())

            # 1) Run models in parallel
            answers: Dict[str, str] = {}
            latencies: Dict[str, float] = {}
            max_workers = int(self.config.max_parallel or max(1, len(self.connectors)))
            with ThreadPoolExecutor(max_workers=max_workers) as pool:
                futs = [
                    pool.submit(
                        self._infer_one,
                        n,
                        c,
                        query,
                        history,
                        deadline=deadline,
                        request_id=request_id,
                        session_id=session_id,
                    )
                    for n, c in self.connectors.items()
                ]
                for f in as_completed(futs):
                    name, text, dt = f.result()
                    latencies[name] = dt
                    if text:
                        answers[name] = text
            if not answers:
                raise ConnectorError(
                    "No model produced an answer.",
                    details={
                        "participants": participants,
                        "latencies_ms": latencies,
                    },
                )

            # 2) Policy
            policy = get_policy(policy_name or self.config.default_policy)
            agg = policy.aggregate(
                query,
                answers=answers,
                latencies=latencies,
                errors={},
                metas={},
                context=history,
                params=None,
            )
            winner = agg.get("winner") or min(answers.keys(), key=lambda k: latencies.get(k, 9e9))
            answer_text = (agg.get("result") or answers[winner]).strip()

            # Ensure verification gets time; adapt search breadth if time is tight
            search_k_per_provider = self.config.search_k_per_provider
            search_max_total = self.config.search_max_total
            if deadline:
                remaining = deadline - time.monotonic()
                if remaining < (MAX_MODEL_TIMEOUT * 0.5):
                    search_k_per_provider = max(2, search_k_per_provider // 2)
                    search_max_total = max(6, search_max_total // 2)

            # 3) Web verification (mandatory)
            sources = self._collect_sources(
                queries=[query, answer_text],
                want_images=want_photos,
                k_per_provider=search_k_per_provider,
                max_total=search_max_total,
                deadline=deadline,
                request_id=request_id,
            )
            web_refs, photos = self._rank_and_verify(answer_text, sources, self.config.min_sources_required)

            if len(web_refs) < self.config.min_sources_required:
                salient = answer_text.split(".")[0].strip()
                if salient:
                    extra = self._collect_sources(
                        queries=[f"\"{salient}\""],
                        want_images=False,
                        k_per_provider=max(2, search_k_per_provider // 2),
                        max_total=search_max_total,
                        deadline=deadline,
                        request_id=request_id,
                    )
                    extra_refs, _ = self._rank_and_verify(
                        answer_text,
                        extra,
                        self.config.min_sources_required - len(web_refs),
                    )
                    for r in extra_refs:
                        if all(r["url"] != e["url"] for e in web_refs):
                            web_refs.append(r)
                            if len(web_refs) >= self.config.min_sources_required:
                                break

            if len(web_refs) < self.config.min_sources_required:
                raise VerificationError(
                    f"Insufficient verification sources (need ≥ {self.config.min_sources_required}).",
                    details={
                        "required": self.config.min_sources_required,
                        "collected": len(web_refs),
                        "schema_version": self.schema_version,
                    },
                )

            # 4) Extract code blocks
            code_blocks = _extract_code_blocks(answer_text)

            # 5) Save assistant output (scoped + encrypted)
            self._save_mem(session_id, "assistant", answer_text, {"ephemeral": False})

            # 6) Winner ref
            wconn = self.connectors.get(winner)
            winner_ref = {
                "name": winner,
                "adapter": getattr(wconn, "adapter", None),
                "endpoint": getattr(wconn, "endpoint", None),
            }

            log.info(
                "engine_run_complete",
                extra={"request_id": request_id, "session_id": session_id, "winner": winner},
            )

            # 7) Strict schema output (DO NOT change required keys)
            payload = {
                "answer": answer_text,
                "winner": winner,
                "winner_ref": winner_ref,
                "participants": participants,
                "code": code_blocks,
                "sources": web_refs,                 # verified (>= min_sources_required)
                "photos": photos if want_photos else [],
            }
            payload["meta"] = {
                "schema_version": self.schema_version,
                "policy": getattr(policy, "name", None),
                "latencies": latencies,
                "policy_scores": agg.get("scores"),
            }
            return payload
        finally:
            _GLOBAL_CONCURRENCY_SEMAPHORE.release()

# =========================================================
# Health Monitor (autonomous backend checks)
# =========================================================
@dataclass
class HealthConfig:
    interval_seconds: int = int(os.getenv("NEXUS_HEALTH_INTERVAL_SEC", "3600"))  # default: 1 hour
    search_probe: str = os.getenv("NEXUS_HEALTH_SEARCH_QUERY", "nexus health check")
    include_memory_check: bool = True

class HealthMonitor:
    def __init__(self, engine: Engine, interval_seconds: int = 3600, autostart: bool = True):
        self.engine = engine
        self.cfg = HealthConfig(interval_seconds=interval_seconds)
        self._thread: Optional[threading.Thread] = None
        self._stop = threading.Event()
        self._lock = threading.Lock()
        self._last: Dict[str, Any] = {"ts": 0, "ok": False, "components": {}}
        self.is_running = False
        if autostart:
            self.start()

    def start(self) -> None:
        if self.is_running:
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._loop, name="NexusHealthMonitor", daemon=True)
        self._thread.start()
        self.is_running = True
        log.info("Health monitor started (interval=%ss)", self.cfg.interval_seconds)

    def stop(self) -> None:
        if not self.is_running:
            return
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=5.0)
        self.is_running = False
        log.info("Health monitor stopped")

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            return json.loads(json.dumps(self._last))  # deep copy

    def run_once(self) -> Dict[str, Any]:
        result = self._compute()
        with self._lock:
            self._last = result
        return result

    def _loop(self) -> None:
        while not self._stop.is_set():
            t0 = time.time()
            try:
                self.run_once()
            except Exception as e:
                log.warning("health monitor failed: %s", e)
            elapsed = time.time() - t0
            to_sleep = max(10.0, self.cfg.interval_seconds - elapsed)
            self._stop.wait(to_sleep)

    def _compute(self) -> Dict[str, Any]:
        ts = int(time.time())
        components: Dict[str, Any] = {}

        # Node stats
        components["node"] = self._node_health()
        components["engine"] = {
            "schema_version": ENGINE_SCHEMA_VERSION,
            "instance_schema_version": getattr(self.engine, "schema_version", None),
        }

        # Connectors
        connectors: Dict[str, Any] = {}
        for name, conn in self.engine.connectors.items():
            t0 = time.time()
            degraded = True
            err = None
            try:
                degraded = conn.health_check()
            except Exception as e:
                err = str(e)
            connectors[name] = {
                "degraded": bool(degraded),
                "latency_ms": int((time.time()-t0)*1000),
                "adapter": getattr(conn, "adapter", None),
                "endpoint": getattr(conn, "endpoint", None),
                "error": err,
            }
        components["connectors"] = connectors

        # Web providers probe
        web: Dict[str, Any] = {}
        if self.engine.web:
            for p in self.engine.web.providers:
                t0 = time.time()
                ok = False
                err = None
                enriched = False
                try:
                    results = p.search(self.cfg.search_probe, k=1, images=False) or []
                    ok = len(results) > 0
                    if ok and self.engine.scraper:
                        _ = self.engine.scraper.enrich(results[0])
                        enriched = True
                except Exception as e:
                    err = str(e)
                web[p.name] = {
                    "ok": bool(ok),
                    "enriched": bool(enriched),
                    "latency_ms": int((time.time()-t0)*1000),
                    "error": err,
                }
        components["web"] = web

        # Memory check (non-destructive, encrypted ping)
        mem = {}
        if self.cfg.include_memory_check and self.engine.memory is not None:
            t0 = time.time()
            try:
                sid = "__health__"
                enc = self.engine.crypter.encrypt("__ping__", aad=self.engine._aad(sid))
                self.engine.memory.save(
                    self.engine._scoped_session(sid),
                    "system",
                    enc,
                    {"ephemeral": True, "enc": "aesgcm", "ttl_seconds": 300},
                )
                got = self.engine.memory.recent(self.engine._scoped_session(sid), limit=1)
                mem = {"ok": bool(got), "latency_ms": int((time.time()-t0)*1000)}
            except Exception as e:
                mem = {"ok": False, "error": str(e)}
        components["memory"] = mem

        ok_overall = self._overall_ok(components)
        return {"ts": ts, "ok": ok_overall, "components": components}

    @staticmethod
    def _overall_ok(components: Dict[str, Any]) -> bool:
        conns = components.get("connectors", {})
        web = components.get("web", {})
        mem = components.get("memory", {"ok": True})
        all_conns_ok = all(not v.get("degraded", True) for v in conns.values()) if conns else True
        any_web_ok = any(v.get("ok") for v in web.values()) if web else True
        mem_ok = bool(mem.get("ok", True))
        return all_conns_ok and any_web_ok and mem_ok

    @staticmethod
    def _node_health() -> Dict[str, Any]:
        info: Dict[str, Any] = {"pid": os.getpid(), "time": int(time.time())}
        try:
            import psutil  # type: ignore
            info["cpu_percent"] = psutil.cpu_percent(interval=0.0)
            vm = psutil.virtual_memory()
            info["memory"] = {"total": vm.total, "available": vm.available, "used": vm.used, "percent": vm.percent}
        except Exception:
            info["cpu_percent"] = None
            info["memory"] = {"total": None, "available": None, "used": None, "percent": None}
        try:
            la1, la5, la15 = os.getloadavg()
            info["load"] = {"1": la1, "5": la5, "15": la15}
        except Exception:
            info["load"] = {"1": None, "5": None, "15": None}
        try:
            total, used, free = shutil.disk_usage(os.getcwd())
            info["disk"] = {"total": total, "used": used, "free": free, "percent": round(used/total*100, 2) if total else None}
        except Exception:
            info["disk"] = {"total": None, "used": None, "free": None, "percent": None}
        return info

# =========================================================
# Secrets-aware web retriever builder
# =========================================================
try:
    from nexus_config import SecretResolver  # your existing resolver
except Exception:
    SecretResolver = None  # type: ignore

def _ensure_resolver(resolver: Optional["SecretResolver"]) -> "SecretResolver":
    if resolver:
        return resolver
    if SecretResolver is None:
        raise MisconfigurationError("SecretResolver not available; ensure nexus_config.py is on PYTHONPATH.")
    providers = [s.strip().lower() for s in os.getenv("NEXUS_SECRETS_PROVIDERS", "aws,azure,gcp").split(",") if s.strip()]
    overrides: Dict[str, str] = {k: v for k, v in os.environ.items() if k.startswith("NEXUS_SECRET_")}
    for k in ("AZURE_KEYVAULT_URL", "GCP_PROJECT"):
        v = os.getenv(k)
        if v:
            overrides[k] = v
    ttl = int(os.getenv("NEXUS_SECRET_TTL_SECONDS", "600"))
    return SecretResolver(providers=providers, overrides=overrides, ttl_seconds=ttl)

def build_web_retriever_from_env(
    headers: Optional[Dict[str, str]] = None,
    resolver: Optional["SecretResolver"] = None,
) -> Optional[WebRetriever]:
    """
    All API keys/tokens are resolved via cloud secrets (SecretResolver). No hardcoded secrets.
    Logical secret names supported (configured via NEXUS_SECRET_<NAME> indirection):
      - SEARCH_GATEWAY_ENDPOINT (optional; may be secret-managed)
      - SEARCH_GATEWAY_KEY
      - TAVILY_API_KEY
      - BING_SEARCH_KEY
      - GOOGLE_CSE_KEY
      - GOOGLE_CSE_CX
    """
    r = _ensure_resolver(resolver)
    providers: List[SearchProvider] = []
    base_headers = dict(headers or {})
    sess = requests.Session()

    allow_external = os.getenv("NEXUS_ALLOW_THIRD_PARTY_SEARCH", "1").lower() not in {"0", "false", "no"}

    gen_ep = r.get("SEARCH_GATEWAY_ENDPOINT") or os.getenv("NEXUS_SEARCH_ENDPOINT")
    gen_key = r.get("SEARCH_GATEWAY_KEY")
    if gen_ep:
        hdrs = dict(base_headers)
        if gen_key:
            hdrs["Authorization"] = f"Bearer {gen_key}"
        providers.append(GenericJSONSearch(gen_ep, headers=hdrs, session=sess))

    if allow_external:
        tav_key = r.get("TAVILY_API_KEY")
        if tav_key:
            providers.append(TavilySearch(tav_key, session=sess))

        bing_key = r.get("BING_SEARCH_KEY")
        if bing_key:
            providers.append(BingWebSearch(bing_key, session=sess))

        g_key = r.get("GOOGLE_CSE_KEY")
        g_cx  = r.get("GOOGLE_CSE_CX")
        if g_key and g_cx:
            providers.append(GoogleCSESearch(g_key, g_cx, session=sess))

        if os.getenv("NEXUS_ENABLE_DDG", "1").lower() not in {"0", "false", "no"}:
            providers.append(DuckDuckGoHTMLSearch(session=sess))

    if not providers:
        return None

    scraper = HtmlScraper(timeout=int(os.getenv("NEXUS_SCRAPE_TIMEOUT", "8")), session=sess)
    return WebRetriever(providers, scraper=scraper)

#End of Engine code# 
#Nexus is an advanced orchestration platform that coordinates LLMs and distributed memory stores across AWS, Azure, and GCP.
#It emphasizes secure, scalable operations with enforced AES-256-GCM encryption, dynamic secret resolution, and multi-cloud memory hygiene.
#Nexus also delivers flexible connector plumbing so new model providers and data planes can be onboarded without rewriting the core engine.



