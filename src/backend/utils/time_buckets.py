"""Time bucketing for telemetry aggregation."""
from __future__ import annotations

import datetime as dt


def current_bucket(interval_minutes: int = 5) -> str:
    now = dt.datetime.utcnow().replace(second=0, microsecond=0)
    minute = (now.minute // interval_minutes) * interval_minutes
    bucket = now.replace(minute=minute)
    return bucket.isoformat() + "Z"
