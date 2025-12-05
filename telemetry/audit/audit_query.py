"""Query helpers for the TelemetryAudit table."""
from __future__ import annotations

import argparse
import logging
import os
from typing import Dict, List

import boto3
from boto3.dynamodb.conditions import Key

logger = logging.getLogger(__name__)

def _audit_table():
    table_name = os.getenv("RYZN_TELEMETRY_AUDIT_TABLE", "TelemetryAudit")
    dynamodb = boto3.resource("dynamodb")
    return dynamodb.Table(table_name)


def query_by_month(month: str) -> List[Dict]:
    """Query audit log entries for a given month."""
    logger.info("Querying audit table for month=%s", month)
    table = _audit_table()
    try:
        response = table.query(IndexName="month-index", KeyConditionExpression=Key("month").eq(month))
        return response.get("Items", [])
    except Exception:
        logger.debug("month-index not available; falling back to scan")
        response = table.scan()
        return [item for item in response.get("Items", []) if item.get("month") == month]


def query_by_partner(partner: str) -> List[Dict]:
    """Query audit log entries for a given partner."""
    logger.info("Querying audit table for partner=%s", partner)
    table = _audit_table()
    try:
        response = table.query(
            IndexName="partner-index", KeyConditionExpression=Key("partner").eq(partner)
        )
        return response.get("Items", [])
    except Exception:
        logger.debug("partner-index not available; falling back to scan")
        response = table.scan()
        return [item for item in response.get("Items", []) if item.get("partner") == partner]


def query_recent(limit: int = 50) -> List[Dict]:
    """Return the most recent audit log entries up to ``limit``."""
    logger.info("Querying audit table for most recent %s items", limit)
    table = _audit_table()
    response = table.scan()
    items = response.get("Items", [])
    sorted_items = sorted(items, key=lambda item: item.get("timestamp", ""), reverse=True)
    return sorted_items[:limit]


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Telemetry audit log inspector")
    subparsers = parser.add_subparsers(dest="command", required=True)

    month_parser = subparsers.add_parser("month", help="Query by month (YYYY-MM)")
    month_parser.add_argument("month", help="Target month in YYYY-MM format")

    partner_parser = subparsers.add_parser("partner", help="Query by partner identifier")
    partner_parser.add_argument("partner", help="Partner identifier")

    recent_parser = subparsers.add_parser("recent", help="List recent audit events")
    recent_parser.add_argument("--limit", type=int, default=20, help="Number of events to return")

    return parser.parse_args()


def _main() -> None:
    logging.basicConfig(level=logging.INFO)
    args = _parse_args()
    if args.command == "month":
        items = query_by_month(args.month)
    elif args.command == "partner":
        items = query_by_partner(args.partner)
    else:
        items = query_recent(args.limit)

    for item in items:
        print(item)


if __name__ == "__main__":
    _main()
