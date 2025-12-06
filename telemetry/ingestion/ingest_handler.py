"""AWS Lambda handler for ingesting telemetry events."""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from telemetry.schema.telemetry_schema import TelemetryEvent, create_event

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

s3_client = boto3.client("s3")
lambda_client = boto3.client("lambda")

RAW_BUCKET = os.getenv("RYZN_RAW_BUCKET", "ryuzen-telemetry-raw")
SANITIZE_FUNCTION = os.getenv("RYZN_SANITIZE_FUNCTION")


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Entrypoint for API Gateway to ingest telemetry events."""

    try:
        body = event.get("body") or {}
        if isinstance(body, str):
            payload = json.loads(body)
        else:
            payload = body

        telemetry_event: TelemetryEvent = create_event(**payload)
        key = f"raw/{telemetry_event.model_name}/{telemetry_event.timestamp_utc.isoformat()}"

        s3_client.put_object(Bucket=RAW_BUCKET, Key=key, Body=json.dumps(payload))
        logger.info("Stored raw telemetry event at key %s", key)

        if SANITIZE_FUNCTION:
            lambda_client.invoke(
                FunctionName=SANITIZE_FUNCTION,
                InvocationType="Event",
                Payload=json.dumps({"bucket": RAW_BUCKET, "key": key}),
            )
            logger.info("Triggered sanitize handler for %s", key)

        response = {
            "statusCode": 200,
            "body": json.dumps({"message": "Telemetry event ingested", "key": key}),
        }
        return response
    except (ValueError, json.JSONDecodeError) as exc:
        logger.error("Invalid telemetry payload: %s", exc)
        return {"statusCode": 400, "body": json.dumps({"error": str(exc)})}
    except (BotoCoreError, ClientError) as exc:  # pragma: no cover - AWS failures
        logger.error("Failed to store telemetry: %s", exc)
        return {"statusCode": 502, "body": json.dumps({"error": "Storage failure"})}


__all__ = ["lambda_handler"]
