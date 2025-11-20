"""Safe logging utilities that avoid leaking PII."""
from __future__ import annotations

import json
import logging
from typing import Any, Dict


class _NoPIIFilter(logging.Filter):
    """Filter that blocks messages containing suspicious keys."""

    SENSITIVE_KEYS = {"ssn", "social", "email", "phone", "pii", "secret", "token"}

    def filter(self, record: logging.LogRecord) -> bool:  # pragma: no cover - defensive
        message = str(record.getMessage()).lower()
        return not any(key in message for key in self.SENSITIVE_KEYS)


def _default_encoder(obj: Any) -> Any:
    if isinstance(obj, (set, frozenset)):
        return list(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


class SafeLogger:
    """Structured JSON logger that redacts potential PII."""

    def __init__(self, name: str = "ryuzen-secure") -> None:
        self.logger = logging.getLogger(name)
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter("%(message)s")
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
        self.logger.addFilter(_NoPIIFilter())

    def _redact(self, data: Dict[str, Any]) -> Dict[str, Any]:
        redacted = {}
        for key, value in data.items():
            key_lower = key.lower()
            if key_lower in {"ssn", "social", "password", "secret", "token", "pii", "raw"}:
                redacted[key] = "[REDACTED]"
            else:
                redacted[key] = value
        return redacted

    def info(self, message: str, **context: Any) -> None:
        payload = {"level": "info", "message": message, **self._redact(context)}
        self.logger.info(json.dumps(payload, default=_default_encoder))

    def warning(self, message: str, **context: Any) -> None:
        payload = {"level": "warning", "message": message, **self._redact(context)}
        self.logger.warning(json.dumps(payload, default=_default_encoder))

    def error(self, message: str, **context: Any) -> None:
        payload = {"level": "error", "message": message, **self._redact(context)}
        self.logger.error(json.dumps(payload, default=_default_encoder))


__all__ = ["SafeLogger"]
