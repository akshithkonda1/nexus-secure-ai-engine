"""Command line utilities for the Ryuzen Telemetry system."""
from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

import boto3

from telemetry.audit import audit_query
from telemetry.bundles.bundle_builder import build_bundle
from telemetry.schema.telemetry_schema import TelemetryEvent
from telemetry.scrubber import scrub_record

logger = logging.getLogger(__name__)


def validate_event(file_path: Path) -> None:
    with file_path.open("r", encoding="utf-8") as f:
        event = json.load(f)
    validated = TelemetryEvent.validate(event)
    print("Event is valid:", validated)


def scrub_event(file_path: Path) -> None:
    with file_path.open("r", encoding="utf-8") as f:
        event = json.load(f)
    sanitized, violation = scrub_record(event)
    print(json.dumps({"sanitized": sanitized, "violation": violation}, indent=2))


def simulate_bundle(partner: str, month: str) -> None:
    bundle_bytes = build_bundle(partner, month)
    output_path = Path(f"bundle_{partner}_{month}.zip")
    output_path.write_bytes(bundle_bytes)
    print(f"Bundle written to {output_path.resolve()}")


def inspect_audit_log(month: str) -> None:
    items = audit_query.query_by_month(month)
    print(json.dumps(items, indent=2))


def diagnose_pipeline() -> None:
    health = {}
    try:
        s3 = boto3.client("s3")
        s3.list_buckets()
        health["s3"] = "ok"
    except Exception as exc:  # noqa: BLE001 - operational check
        health["s3"] = f"error: {exc}"
    try:
        dynamodb = boto3.client("dynamodb")
        dynamodb.list_tables()
        health["dynamodb"] = "ok"
    except Exception as exc:  # noqa: BLE001
        health["dynamodb"] = f"error: {exc}"
    print(json.dumps(health, indent=2))


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Ryuzen Telemetry CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    validate_parser = subparsers.add_parser("validate-event", help="Validate a telemetry event JSON file")
    validate_parser.add_argument("file", type=Path)

    scrub_parser = subparsers.add_parser("scrub-event", help="Scrub potential PII from an event JSON file")
    scrub_parser.add_argument("file", type=Path)

    simulate_parser = subparsers.add_parser("simulate-bundle", help="Build a bundle locally without uploading")
    simulate_parser.add_argument("partner")
    simulate_parser.add_argument("month", help="Target month in YYYY-MM format")

    inspect_parser = subparsers.add_parser("inspect-audit-log", help="Inspect audit events for a month")
    inspect_parser.add_argument("month", help="Target month in YYYY-MM format")

    subparsers.add_parser("diagnose-pipeline", help="Perform simple pipeline health checks")

    return parser


def main(argv: list[str] | None = None) -> None:
    logging.basicConfig(level=logging.INFO)
    args = _build_parser().parse_args(argv)

    if args.command == "validate-event":
        validate_event(args.file)
    elif args.command == "scrub-event":
        scrub_event(args.file)
    elif args.command == "simulate-bundle":
        simulate_bundle(args.partner, args.month)
    elif args.command == "inspect-audit-log":
        inspect_audit_log(args.month)
    elif args.command == "diagnose-pipeline":
        diagnose_pipeline()
    else:
        raise ValueError(f"Unknown command {args.command}")


if __name__ == "__main__":
    main(sys.argv[1:])
