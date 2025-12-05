"""Basic PII redaction helpers."""
from __future__ import annotations

from typing import Iterable
import re


class PIIRedactor:
    """Removes obvious PII tokens using deterministic regex patterns."""

    EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
    PHONE_PATTERN = re.compile(r"\b\+?\d[\d\s().-]{7,}\b")
    SSN_PATTERN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")

    def __init__(self, placeholder: str = "[REDACTED]", additional_patterns: Iterable[re.Pattern[str]] | None = None) -> None:
        self.placeholder = placeholder
        self.additional_patterns = list(additional_patterns or [])

    def redact(self, text: str) -> str:
        patterns = [self.EMAIL_PATTERN, self.PHONE_PATTERN, self.SSN_PATTERN, *self.additional_patterns]
        redacted = text
        for pattern in patterns:
            redacted = pattern.sub(self.placeholder, redacted)
        return redacted
