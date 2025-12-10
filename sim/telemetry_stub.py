"""Telemetry stub that simulates PII removal for offline testing."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict

PII_PATTERN = re.compile(r"([\w.-]+)@([\w.-]+)")
PHONE_PATTERN = re.compile(r"\b\+?\d{2,3}[- ]?\d{3}[- ]?\d{4}\b")


@dataclass
class TelemetryPIISanitizer:
    """Remove obvious PII markers before logging telemetry."""

    replacement: str = "[redacted]"

    def scrub_text(self, text: str) -> str:
        text = PII_PATTERN.sub(self.replacement, text)
        text = PHONE_PATTERN.sub(self.replacement, text)
        return text

    def scrub_payload(self, payload: Dict[str, object]) -> Dict[str, object]:
        return {key: self.scrub_text(str(value)) for key, value in payload.items()}
