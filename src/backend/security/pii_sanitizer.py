"""Basic PII scrubbing utilities."""
from __future__ import annotations

import re
from typing import Dict, Union

Payload = Dict[str, Union[str, int, float, dict]]


class PiiSanitizer:
    EMAIL_REGEX = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
    PHONE_REGEX = re.compile(r"\+?\d[\d\-\s]{7,}\d")

    def sanitize(self, payload: Payload | str) -> Payload | str:
        if isinstance(payload, str):
            return self._sanitize_string(payload)
        cleaned = {}
        for key, value in payload.items():
            if isinstance(value, str):
                cleaned[key] = self._sanitize_string(value)
            elif isinstance(value, dict):
                cleaned[key] = self.sanitize(value)  # type: ignore[assignment]
            else:
                cleaned[key] = value
        return cleaned

    def _sanitize_string(self, value: str) -> str:
        value = self.EMAIL_REGEX.sub("[redacted-email]", value)
        value = self.PHONE_REGEX.sub("[redacted-phone]", value)
        return value
