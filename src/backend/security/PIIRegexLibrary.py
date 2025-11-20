"""Regex patterns for identifying common PII elements."""
from __future__ import annotations

import re
from typing import List, Tuple

PII_PATTERNS: List[Tuple[str, str]] = [
    ("SSN", r"\b(?!000|666)[0-8][0-9]{2}-?(?!00)[0-9]{2}-?(?!0000)[0-9]{4}\b"),
    ("PHONE", r"\b\+?\d{1,3}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b"),
    ("EMAIL", r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"),
    ("DOB", r"\b(?:\d{1,2}[/-]){2}\d{2,4}\b"),
    ("CREDIT_CARD", r"\b(?:\d[ -]*?){13,19}\b"),
    ("DRIVERS_LICENSE", r"\b[A-Z]{1}\d{6,14}\b"),
    ("PASSPORT", r"\b[APC]?[0-9]{7,9}\b"),
    ("IP_ADDRESS", r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)(?:\.|$)){4}\b|\b([A-Fa-f0-9:]+:+)+[A-Fa-f0-9]+\b"),
    ("GPS", r"\b-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+\b"),
    ("ADDRESS", r"\b\d+\s+[A-Za-z0-9'\.\-\s]+\b"),
    ("FINANCIAL_ID", r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b"),
    ("MRN", r"\b\d{6,10}\b"),
]

COMPILED_PATTERNS = [(name, re.compile(pattern, re.IGNORECASE)) for name, pattern in PII_PATTERNS]

__all__ = ["PII_PATTERNS", "COMPILED_PATTERNS"]
