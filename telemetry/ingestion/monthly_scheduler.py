"""Monthly bundle scheduling orchestrator."""
from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta
from typing import List

from telemetry.audit import audit_logger
from telemetry.bundles.bundle_builder import build_bundle
from telemetry.delivery import s3_delivery

logger = logging.getLogger(__name__)


def _determine_month(target_month: str | None) -> str:
    if target_month:
        return target_month
    today = datetime.utcnow().date().replace(day=1)
    previous_month = today - timedelta(days=1)
    return previous_month.strftime("%Y-%m")


def _partner_list() -> List[str]:
    partners = os.getenv("RYZN_PARTNERS", "")
    return [p.strip() for p in partners.split(",") if p.strip()]


def run_scheduler(target_month: str | None = None) -> None:
    """Run the monthly bundle generation workflow for all onboarded partners."""
    month = _determine_month(target_month)
    partners = _partner_list()
    if not partners:
        logger.warning("No partners configured; skipping bundle generation")
        return

    logger.info("Starting monthly scheduler for month=%s partners=%s", month, partners)
    for partner in partners:
        try:
            bundle_bytes = build_bundle(partner, month)
            s3_key = s3_delivery.upload_bundle(partner, month, bundle_bytes)
            signed_url = s3_delivery.generate_signed_url(partner, month)
            s3_delivery.notify_partner(partner, month, signed_url)
            audit_logger.log_event(
                event_type="BUNDLE_DELIVERED",
                partner=partner,
                month=month,
                details={"s3_key": s3_key, "signed_url": signed_url},
            )
        except Exception as exc:  # noqa: BLE001 - surface operational errors
            logger.exception("Failed processing partner=%s month=%s", partner, month)
            audit_logger.log_event(
                event_type="ERROR",
                partner=partner,
                month=month,
                details={"error": str(exc)},
            )


def lambda_handler(event, context):  # noqa: ANN001 - AWS Lambda signature
    target_month = event.get("month") if isinstance(event, dict) else None
    run_scheduler(target_month)
    return {"status": "ok"}


__all__ = ["run_scheduler", "lambda_handler"]
