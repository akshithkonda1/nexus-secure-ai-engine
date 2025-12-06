"""Scrubbing utilities for Ryuzen Telemetry."""
from __future__ import annotations

import logging
from typing import Any, Dict, Tuple

logger = logging.getLogger(__name__)


SUSPECT_KEYS = {"email", "name", "user_id", "ip", "phone"}


def scrub_record(record: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
    """Scrub potential PII from a telemetry record.

    Args:
        record: Raw telemetry record.

    Returns:
        A tuple of (sanitized_record, violation_flag).
    """

    sanitized = dict(record)
    violation_detected = False
    for key in list(sanitized.keys()):
        if key.lower() in SUSPECT_KEYS:
            logger.debug("Removing potential PII field: %s", key)
            sanitized.pop(key, None)
            violation_detected = True
    logger.info("Scrubbed telemetry record; violation_detected=%s", violation_detected)
    return sanitized, violation_detected


__all__ = ["scrub_record"]
