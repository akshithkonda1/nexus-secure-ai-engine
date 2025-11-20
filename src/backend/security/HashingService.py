"""Hashing utilities for telemetry without PII leakage."""
from __future__ import annotations

import datetime as _dt
import hashlib
import hmac
import os
from typing import Tuple

from ..utils.RegionBucket import ip_to_region
from ..utils.TimeBucket import bucket_timestamp


def generate_rotating_salt() -> bytes:
    now = _dt.datetime.utcnow()
    return hashlib.sha256(f"{now:%Y%m%d%H}{os.urandom(8).hex()}".encode()).digest()


def hash_identifier(value: str, salt: bytes) -> str:
    digest = hmac.new(salt, value.encode("utf-8"), hashlib.blake2b).hexdigest()
    return digest


def stable_longitudinal_hash(value: str) -> str:
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return digest


def bucket_timestamp_value(timestamp: _dt.datetime) -> Tuple[int, int, int, int]:
    return bucket_timestamp(timestamp)


def region_bucket(ip: str) -> str:
    return ip_to_region(ip)


__all__ = [
    "generate_rotating_salt",
    "hash_identifier",
    "stable_longitudinal_hash",
    "bucket_timestamp_value",
    "region_bucket",
]
