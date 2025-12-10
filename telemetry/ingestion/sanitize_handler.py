"""AWS Lambda handler for sanitizing telemetry events."""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from telemetry.scrubber import scrubber
from telemetry.scrubber.certificate_generator import generate_zero_pii_certificate
from telemetry.scrubber.quarantine import send_to_quarantine

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

s3_client = boto3.client("s3")
dynamodb_resource = boto3.resource("dynamodb")

RAW_BUCKET = os.getenv("RYZN_RAW_BUCKET", "ryuzen-telemetry-raw")
SANITIZED_BUCKET = os.getenv("RYZN_SANITIZED_BUCKET", "ryuzen-telemetry-sanitized")
AUDIT_TABLE = os.getenv("RYZN_AUDIT_TABLE", "TelemetryAudit")


def _log_audit(entry: Dict[str, Any]) -> None:
    table = dynamodb_resource.Table(AUDIT_TABLE)
    table.put_item(Item=entry)


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Sanitize raw telemetry events fetched from S3."""

    try:
        bucket = event.get("bucket", RAW_BUCKET)
        key = event.get("key") or event.get("Records", [{}])[0].get("s3", {}).get("object", {}).get("key")
        if not key:
            raise ValueError("Missing S3 object key for sanitization")

        response = s3_client.get_object(Bucket=bucket, Key=key)
        raw_payload = json.loads(response["Body"].read())

        sanitized_payload, violation_flag = scrubber.scrub_record(raw_payload)

        if violation_flag:
            send_to_quarantine(raw_payload, reason="PII detected during sanitization")
            audit_entry = {
                "id": key,
                "status": "quarantined",
                "reason": "PII detected",
                "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            }
            _log_audit(audit_entry)
            logger.warning("Record quarantined for key %s", key)
            return {"statusCode": 200, "body": json.dumps({"status": "quarantined", "key": key})}

        sanitized_payload["sanitized"] = True
        sanitized_key = key.replace("raw/", "sanitized/")
        s3_client.put_object(Bucket=SANITIZED_BUCKET, Key=sanitized_key, Body=json.dumps(sanitized_payload))
        logger.info("Stored sanitized telemetry event at key %s", sanitized_key)

        certificate = generate_zero_pii_certificate({
            "telemetry_version": sanitized_payload.get("telemetry_version"),
            "key": sanitized_key,
        })

        audit_entry = {
            "id": sanitized_key,
            "status": "sanitized",
            "certificate": certificate,
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        }
        _log_audit(audit_entry)
        return {"statusCode": 200, "body": json.dumps({"status": "sanitized", "key": sanitized_key})}
    except (ValueError, json.JSONDecodeError) as exc:
        logger.error("Sanitization error: %s", exc)
        return {"statusCode": 400, "body": json.dumps({"error": str(exc)})}
    except (BotoCoreError, ClientError) as exc:  # pragma: no cover - AWS failures
        logger.error("AWS error during sanitization: %s", exc)
        return {"statusCode": 502, "body": json.dumps({"error": "AWS error"})}


__all__ = ["lambda_handler"]
