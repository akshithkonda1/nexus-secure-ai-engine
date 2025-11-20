"""ID generation utilities for secure traceability without PII."""
from __future__ import annotations

import os
import secrets
import uuid


def short_id(length: int = 12) -> str:
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def cluster_unique_id() -> str:
    return uuid.uuid4().hex


def trace_id() -> str:
    random_bytes = os.urandom(16)
    return random_bytes.hex()


__all__ = ["short_id", "cluster_unique_id", "trace_id"]
