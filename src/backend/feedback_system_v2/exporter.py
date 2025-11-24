"""Feedback export utilities."""
from __future__ import annotations

import csv
import json
import os
from io import StringIO
from typing import Any, Dict, Iterable, List

try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
except Exception:  # pragma: no cover - optional dependency
    boto3 = None  # type: ignore[misc]
    BotoCoreError = ClientError = Exception  # type: ignore[misc,assignment]


class FeedbackExporter:
    def __init__(self, s3_bucket: str | None = None) -> None:
        self.s3_bucket = s3_bucket or os.environ.get("FEEDBACK_S3_BUCKET")

    def to_csv(self, records: Iterable[Dict[str, Any]]) -> str:
        buffer = StringIO()
        rows = list(records)
        if not rows:
            return ""
        writer = csv.DictWriter(buffer, fieldnames=sorted({k for row in rows for k in row.keys()}))
        writer.writeheader()
        for row in rows:
            writer.writerow(row)
        return buffer.getvalue()

    def to_json(self, records: Iterable[Dict[str, Any]]) -> str:
        return json.dumps(list(records), indent=2, ensure_ascii=False)

    def upload_s3(self, key: str, content: str) -> bool:
        if not self.s3_bucket or boto3 is None:
            return False
        try:
            client = boto3.client("s3")
            client.put_object(Bucket=self.s3_bucket, Key=key, Body=content.encode("utf-8"))
            return True
        except (BotoCoreError, ClientError):
            return False

    def export_bigquery(self, records: List[Dict[str, Any]]) -> bool:
        # Stub for BigQuery integration
        return bool(records)


def get_exporter(s3_bucket: str | None = None) -> FeedbackExporter:
    return FeedbackExporter(s3_bucket)
