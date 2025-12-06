"""Deletion workflow for telemetry data after delivery."""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Dict

import boto3

from telemetry.audit import audit_logger

logger = logging.getLogger(__name__)

s3_client = boto3.client("s3")


RAW_BUCKET_ENV = "RYZN_RAW_BUCKET"
SANITIZED_BUCKET_ENV = "RYZN_SANITIZED_BUCKET"
ANALYTICS_BUCKET_ENV = "RYZN_ANALYTICS_BUCKET"


def _delete_prefix(bucket: str, prefix: str) -> None:
    logger.info("Deleting objects from bucket=%s prefix=%s", bucket, prefix)
    paginator = s3_client.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        objects = page.get("Contents", [])
        if not objects:
            continue
        delete_payload = {"Objects": [{"Key": obj["Key"]} for obj in objects]}
        s3_client.delete_objects(Bucket=bucket, Delete=delete_payload)


def delete_telemetry(partner: str, month: str) -> Dict[str, str]:
    """Delete telemetry artifacts for a partner/month across buckets."""

    raw_bucket = os.getenv(RAW_BUCKET_ENV, "ryzn-raw")
    sanitized_bucket = os.getenv(SANITIZED_BUCKET_ENV, "ryzn-sanitized")
    analytics_bucket = os.getenv(ANALYTICS_BUCKET_ENV, "ryzn-analytics")

    prefixes = {
        raw_bucket: f"raw/{partner}/{month}/",
        sanitized_bucket: f"sanitized/{partner}/{month}/",
        analytics_bucket: f"analytics/{month}/",
    }

    for bucket, prefix in prefixes.items():
        _delete_prefix(bucket, prefix)

    audit_entry = {
        "partner": partner,
        "month": month,
        "event_type": "TELEMETRY_DELETED",
        "data_deleted": True,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    audit_logger.log_event(
        event_type="TELEMETRY_DELETED",
        partner=partner,
        month=month,
        details={"deleted_prefixes": prefixes},
    )
    return audit_entry


def lambda_handler(event, context):  # noqa: ANN001 - AWS Lambda signature
    partner = event.get("partner")
    month = event.get("month")
    if not partner or not month:
        raise ValueError("partner and month must be provided for telemetry deletion")
    return delete_telemetry(partner, month)


__all__ = ["delete_telemetry", "lambda_handler"]
