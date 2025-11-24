"""DynamoDB wrapper for feedback persistence."""
from __future__ import annotations

import os
from typing import Any, Dict, List

try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
except Exception:  # pragma: no cover - optional dependency
    boto3 = None  # type: ignore[misc]
    BotoCoreError = ClientError = Exception  # type: ignore[misc,assignment]


class FeedbackDBService:
    def __init__(self, table_name: str | None = None) -> None:
        self.table_name = table_name or os.environ.get("FEEDBACK_TABLE", "feedback")
        self.enabled = boto3 is not None
        self._table = None
        if self.enabled:
            try:
                dynamo = boto3.resource("dynamodb")
                self._table = dynamo.Table(self.table_name)
            except Exception:
                self.enabled = False

    def insert_feedback(self, record: Dict[str, Any]) -> None:
        if not self.enabled or not self._table:
            return
        try:
            self._table.put_item(Item=record)
        except (BotoCoreError, ClientError):
            pass

    def query_all(self) -> List[Dict[str, Any]]:
        if not self.enabled or not self._table:
            return []
        try:
            response = self._table.scan()
            return response.get("Items", [])  # type: ignore[return-value]
        except (BotoCoreError, ClientError):
            return []


def get_db_service(table_name: str | None = None) -> FeedbackDBService:
    return FeedbackDBService(table_name)
