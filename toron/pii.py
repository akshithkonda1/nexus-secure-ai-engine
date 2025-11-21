"""Simple PII redaction and masking utilities."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

EMAIL_PATTERN = re.compile(r"[\w\.-]+@[\w\.-]+", re.IGNORECASE)
PHONE_PATTERN = re.compile(r"\b\+?\d[\d\-\s]{7,}\d\b")
NAME_PATTERN = re.compile(r"\b([A-Z][a-z]+)\b")


@dataclass
class PIIPipeline:
    """Provide deterministic redaction and masking for text bodies."""

    redaction_token: str = "[REDACTED]"

    def redact(self, text: str) -> str:
        """Redact email addresses and phone numbers."""

        text = EMAIL_PATTERN.sub(self.redaction_token, text)
        return PHONE_PATTERN.sub(self.redaction_token, text)

    def mask_names(self, text: str) -> str:
        """Lightweight masking for capitalized names."""

        def _mask(match: re.Match[str]) -> str:
            name = match.group(1)
            if len(name) <= 2:
                return self.redaction_token
            star_count = min(3, max(1, len(name) - 2))
            return name[0] + "*" * star_count + name[-1]

        return NAME_PATTERN.sub(_mask, text)

    def pipeline(self, text: str, fields: Iterable[str] | None = None) -> str:
        """Apply redaction and masking in sequence for selected field hints."""

        fields = set(fields or [])
        processed = self.redact(text) if not fields or "contact" in fields else text
        return self.mask_names(processed)
