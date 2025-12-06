"""Quarantine utilities for flagged telemetry records."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Dict

import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

S3_BUCKET = "ryuzen-telemetry-quarantine"


def send_to_quarantine(record: Dict, reason: str) -> None:
    """Send a flagged record to the quarantine S3 bucket."""

    s3_client = boto3.client("s3")
    key = f"quarantine/{datetime.now(timezone.utc).isoformat()}"
    payload = {
        "reason": reason,
        "record": record,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }
    logger.warning("Sending record to quarantine: %s", reason)
    s3_client.put_object(Bucket=S3_BUCKET, Key=key, Body=json.dumps(payload))


__all__ = ["send_to_quarantine"]
