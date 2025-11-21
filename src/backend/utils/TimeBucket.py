"""Time bucketing utilities for telemetry and rate limits."""
from __future__ import annotations

import datetime as _dt
from typing import Tuple


def bucket_timestamp(timestamp: _dt.datetime) -> Tuple[int, int, int, int]:
    ts = timestamp.astimezone(_dt.timezone.utc)
    return ts.year, ts.month, ts.day, ts.hour


def bucket_by_day(timestamp: _dt.datetime) -> str:
    year, month, day, _ = bucket_timestamp(timestamp)
    return f"{year:04d}-{month:02d}-{day:02d}"


def bucket_by_hour(timestamp: _dt.datetime) -> str:
    year, month, day, hour = bucket_timestamp(timestamp)
    return f"{year:04d}-{month:02d}-{day:02d}T{hour:02d}:00Z"


def bucket_for_region(timestamp: _dt.datetime, region: str) -> str:
    return f"{bucket_by_hour(timestamp)}::{region or 'unknown'}"


__all__ = [
    "bucket_timestamp",
    "bucket_by_day",
    "bucket_by_hour",
    "bucket_for_region",
]
