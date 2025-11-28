"""PII-safe telemetry utilities for Toron."""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Dict

from pydantic import BaseModel, field_validator


PII_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}",
        r"\+?\d[\d\-\s]{8,}\d",
        r"\b\d{1,3}\s+[A-Za-z]{2,}\s+(Street|St|Ave|Road|Rd|Lane|Ln|Blvd)\b",
        r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}\b",
        r"\b[A-Z][a-z]+\s+[A-Z][a-z]+\b",
    ]
]


class TelemetryRecord(BaseModel):
    """Normalized, sanitized telemetry payload."""

    prompt_type: str
    model_drift: float
    contradiction_rate: float
    validation_confidence: float
    timestamp: datetime

    @field_validator("model_drift", "contradiction_rate", "validation_confidence")
    @classmethod
    def clamp(cls, value: float) -> float:
        return max(0.0, min(1.0, round(value, 4)))

    @field_validator("prompt_type")
    @classmethod
    def normalize_prompt_type(cls, value: str) -> str:
        return re.sub(r"\s+", " ", value).strip().lower() or "unknown"

    @field_validator("timestamp")
    @classmethod
    def ensure_timezone(cls, value: datetime) -> datetime:
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _scrub_text(text: str) -> str:
    scrubbed = text
    for pattern in PII_PATTERNS:
        scrubbed = pattern.sub("[REDACTED]", scrubbed)
    return scrubbed


def sanitize_telemetry(fields: Dict[str, str]) -> Dict[str, str]:
    """Remove PII tokens using regex-based anonymization."""

    sanitized: Dict[str, str] = {}
    for key, value in fields.items():
        if not isinstance(value, str):
            continue
        sanitized[key] = _scrub_text(value)
    return sanitized


def build_telemetry_record(
    prompt_type: str, drift: float, contradiction_rate: float, validation_confidence: float
) -> TelemetryRecord:
    """Create a sanitized telemetry record."""

    return TelemetryRecord(
        prompt_type=prompt_type,
        model_drift=drift,
        contradiction_rate=contradiction_rate,
        validation_confidence=validation_confidence,
        timestamp=datetime.now(tz=timezone.utc),
    )
