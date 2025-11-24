"""Regex-driven PII scrubbing utilities."""
from __future__ import annotations

import re
from typing import Pattern

EMAIL_PATTERN: Pattern[str] = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_PATTERN: Pattern[str] = re.compile(r"\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b")
SSN_PATTERN: Pattern[str] = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
ADDRESS_PATTERN: Pattern[str] = re.compile(
    r"\b\d+\s+(?:[A-Za-z0-9'.-]+\s+){1,5}(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Lane|Ln\.?|Boulevard|Blvd\.?|Way|Dr\.?|Drive)\b",
    re.IGNORECASE,
)
NAME_PATTERN: Pattern[str] = re.compile(r"\b([A-Z][a-z]+\s[A-Z][a-z]+)\b")


def _mask(pattern: Pattern[str], text: str, token: str) -> str:
    return pattern.sub(token, text)


def remove_pii(text: str, *, strip_names: bool = False) -> str:
    """Remove common PII artifacts from freeform text."""

    scrubbed = _mask(EMAIL_PATTERN, text, "[email_redacted]")
    scrubbed = _mask(PHONE_PATTERN, scrubbed, "[phone_redacted]")
    scrubbed = _mask(SSN_PATTERN, scrubbed, "[ssn_redacted]")
    scrubbed = _mask(ADDRESS_PATTERN, scrubbed, "[address_redacted]")
    if strip_names:
        scrubbed = _mask(NAME_PATTERN, scrubbed, "[name_redacted]")
    return scrubbed
