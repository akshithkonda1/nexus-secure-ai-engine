"""AWS Lambda handler to convert sanitized events into Parquet for analytics."""

from __future__ import annotations

import io
import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List

import boto3
import pandas as pd
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

s3_client = boto3.client("s3")

SANITIZED_BUCKET = os.getenv("RYZN_SANITIZED_BUCKET", "ryuzen-telemetry-sanitized")
ANALYTICS_BUCKET = os.getenv("RYZN_ANALYTICS_BUCKET", "ryuzen-telemetry-analytics")


def _write_parquet(data: List[Dict[str, Any]], key: str) -> None:
    buffer = io.BytesIO()
    df = pd.DataFrame(data)
    df.to_parquet(buffer, index=False)
    buffer.seek(0)
    s3_client.put_object(Bucket=ANALYTICS_BUCKET, Key=key, Body=buffer.getvalue())
    logger.info("Wrote Parquet data to %s", key)


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Process sanitized telemetry events into Parquet partitions."""

    try:
        keys = event.get("keys") or []
        if not keys and "Records" in event:
            keys = [record.get("s3", {}).get("object", {}).get("key") for record in event.get("Records", [])]

        processed = 0
        for key in keys:
            if not key:
                continue
            response = s3_client.get_object(Bucket=SANITIZED_BUCKET, Key=key)
            payload = json.loads(response["Body"].read())

            model_name = payload.get("model_name", "unknown")
            timestamp_str = payload.get("timestamp_utc")
            timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00")) if timestamp_str else datetime.utcnow()
            partition_key = (
                f"{model_name}/year={timestamp.year}/month={timestamp.month:02d}/day={timestamp.day:02d}/"
                f"event_{timestamp.isoformat()}.parquet"
            )

            _write_parquet([payload], partition_key)
            processed += 1

        return {"statusCode": 200, "body": json.dumps({"processed": processed})}
    except (BotoCoreError, ClientError) as exc:  # pragma: no cover - AWS failures
        logger.error("AWS error during analytics preparation: %s", exc)
        return {"statusCode": 502, "body": json.dumps({"error": "AWS error"})}
    except Exception as exc:  # pragma: no cover - catch-all for operational resilience
        logger.error("Unexpected error in analytics handler: %s", exc)
        return {"statusCode": 500, "body": json.dumps({"error": "Processing error"})}


__all__ = ["lambda_handler"]
