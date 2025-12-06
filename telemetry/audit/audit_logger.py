"""Audit logging utilities for telemetry actions."""
from __future__ import annotations

from datetime import datetime, timezone
import logging
import os
from typing import Any, Dict, Optional

import boto3

logger = logging.getLogger(__name__)


def _audit_table():
    table_name = os.getenv("RYZN_TELEMETRY_AUDIT_TABLE", "TelemetryAudit")
    dynamodb = boto3.resource("dynamodb")
    return dynamodb.Table(table_name)


def log_event(
    event_type: str,
    partner: Optional[str],
    month: Optional[str],
    details: Optional[Dict[str, Any]] = None,
) -> None:
    """Log an event to the telemetry audit table.

    Args:
        event_type: Type of event to record.
        partner: Partner identifier, if applicable.
        month: Month identifier (YYYY-MM), if applicable.
        details: Additional structured detail payload.
    """

    item = {
        "event_type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if partner:
        item["partner"] = partner
    if month:
        item["month"] = month
    if details:
        item["details"] = details

    logger.info(
        "Writing audit event: type=%s partner=%s month=%s", event_type, partner, month
    )
    _audit_table().put_item(Item=item)


__all__ = ["log_event"]
