"""Triple-layer scrubbing engine for Ryuzen Telemetry System."""

from __future__ import annotations

import copy
import json
import logging
import re
from typing import Any, Dict, Tuple

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Precompiled regex patterns for common PII elements.
PII_PATTERNS = {
    "email": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "phone": re.compile(r"\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b"),
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "address": re.compile(r"\b\d+\s+[A-Za-z0-9.\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln)\b", re.IGNORECASE),
}


def _scrub_value(value: Any) -> tuple[Any, bool]:
    """Scrub a single value for PII using regex patterns."""

    if isinstance(value, str):
        violation_found = False
        scrubbed = value
        for pattern in PII_PATTERNS.values():
            scrubbed, replacements = pattern.subn("[REDACTED]", scrubbed)
            if replacements:
                violation_found = True
        return scrubbed, violation_found

    if isinstance(value, list):
        scrubbed_list = []
        violation_found = False
        for item in value:
            scrubbed_item, item_violation = _scrub_value(item)
            violation_found = violation_found or item_violation
            scrubbed_list.append(scrubbed_item)
        return scrubbed_list, violation_found

    if isinstance(value, dict):
        scrubbed_dict: Dict[str, Any] = {}
        violation_found = False
        for key, val in value.items():
            scrubbed_val, item_violation = _scrub_value(val)
            violation_found = violation_found or item_violation
            scrubbed_dict[key] = scrubbed_val
        return scrubbed_dict, violation_found

    return value, False


def sanitize_with_llm(data: Dict[str, Any]) -> Dict[str, Any]:
    """Placeholder for LLM-powered sanitization.

    The function currently acts as a pass-through and should be wired to
    an external LLM service to enhance contextual sanitization.
    """

    logger.debug("sanitize_with_llm received data: %s", json.dumps(data))
    return data


def scrub_record(data: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
    """Scrub a telemetry record for PII using regex and LLM sanitization."""

    sanitized_data = copy.deepcopy(data)
    violation_flag = False

    for key, value in sanitized_data.items():
        scrubbed_value, violation_detected = _scrub_value(value)
        if violation_detected:
            violation_flag = True
        sanitized_data[key] = scrubbed_value

    sanitized_data = sanitize_with_llm(sanitized_data)

    if violation_flag:
        logger.warning("PII violation detected and scrubbed")
    else:
        logger.info("Record passed sanitization checks")

    return sanitized_data, violation_flag


__all__ = ["scrub_record", "sanitize_with_llm"]
