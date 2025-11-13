"""Lightweight PII detection and redaction helpers.

The implementation intentionally relies on regular expressions only so that it
remains portable across all Nexus deployment targets. The function exposed by
this module *never* returns the raw value that matched a PII pattern. Instead it
returns high level warnings which can safely be surfaced to end users and
recorded in logs.
"""
from __future__ import annotations

import re
from typing import Callable, List, Tuple

_PII_PATTERNS: Tuple[Tuple[str, re.Pattern[str]], ...] = (
    (
        "email",
        re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", re.IGNORECASE),
    ),
    (
        "phone number",
        re.compile(
            r"\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b"
        ),
    ),
    (
        "ssn",
        re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    ),
    (
        "credit card",
        re.compile(
            r"\b(?:\d[ -]*?){13,16}\b"
        ),
    ),
    (
        "ipv4",
        re.compile(
            r"\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.|$)){4}\b"
        ),
    ),
    (
        "street address",
        re.compile(
            r"\b\d{1,5}\s+(?:[A-Za-z0-9]+\s){1,4}(?:Street|St\.?|Road|Rd\.?|Avenue|Ave\.?|Boulevard|Blvd\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Way)\b",
            re.IGNORECASE,
        ),
    ),
)


def _warning_formatter(kind: str) -> Callable[[str], str]:
    """Return a helper that formats warnings without leaking the raw match."""

    def _format(_value: str) -> str:
        return f"Detected {kind}: [redacted]"

    return _format


def redact_and_detect(text: str) -> Tuple[str, List[str]]:
    """Redact common PII from *text* and return the sanitised value.

    Parameters
    ----------
    text:
        The raw string received from the caller.

    Returns
    -------
    tuple[str, list[str]]
        A tuple containing the redacted text and a list of warnings describing
        the types of PII that were detected. The warnings intentionally avoid
        echoing back the sensitive content.
    """

    if not text:
        return text, []

    warnings: List[str] = []
    formatted: List[str] = []
    redacted = text
    for label, pattern in _PII_PATTERNS:
        formatter = _warning_formatter(label)
        matches = list(pattern.finditer(redacted))
        if not matches:
            continue
        warnings.extend(formatter(match.group(0)) for match in matches)
        redacted = pattern.sub("[REDACTED]", redacted)

    # Collapse duplicates whilst preserving order so callers do not see a flood
    # of identical warnings when multiple matches of the same type are present.
    seen = set()
    for warning in warnings:
        if warning in seen:
            continue
        seen.add(warning)
        formatted.append(warning)

    return redacted, formatted


__all__ = ["redact_and_detect"]
