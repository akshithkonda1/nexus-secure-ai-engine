"""Manifest validation utilities for telemetry bundles."""
from __future__ import annotations

import logging
import re
from typing import Any, Dict

logger = logging.getLogger(__name__)

REQUIRED_FIELDS = {
    "partner": str,
    "month": str,
    "telemetry_version": str,
    "record_count": int,
    "schema_hash": str,
    "sanitized": bool,
    "certificate_ref": str,
}

MONTH_PATTERN = re.compile(r"^\d{4}-\d{2}$")


def _check_types(manifest: Dict[str, Any]) -> bool:
    for field, expected in REQUIRED_FIELDS.items():
        if field not in manifest:
            logger.error("Manifest missing required field: %s", field)
            return False
        if not isinstance(manifest[field], expected):
            logger.error("Manifest field %s expected %s but got %s", field, expected, type(manifest[field]))
            return False
    return True


def validate_manifest(manifest: Dict[str, Any]) -> bool:
    """Validate a telemetry bundle manifest.

    Args:
        manifest: Manifest dictionary.

    Returns:
        True if manifest is valid, False otherwise.
    """

    if not _check_types(manifest):
        return False

    if not MONTH_PATTERN.match(manifest["month"]):
        logger.error("Invalid month format in manifest: %s", manifest["month"])
        return False

    if manifest.get("record_count", 0) < 0:
        logger.error("record_count must be non-negative")
        return False

    if not manifest.get("schema_hash"):
        logger.error("schema_hash must be provided")
        return False

    if manifest.get("sanitized") is not True:
        logger.error("sanitized flag must be True")
        return False

    return True


__all__ = ["validate_manifest"]
