"""Telemetry schema definitions for Ryuzen Telemetry System."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict
import logging

logger = logging.getLogger(__name__)


@dataclass
class TelemetryEvent:
    """Simple representation of a telemetry event.

    This class is intentionally minimal and focuses on the fields that the
    telemetry pipeline requires for routing and aggregation. The schema can be
    extended in later phases without breaking callers that rely on these
    validation helpers.
    """

    event_type: str
    timestamp: datetime
    model_id: str
    partner: str | None = None
    payload: Dict[str, Any] | None = None

    @classmethod
    def validate(cls, event: Dict[str, Any]) -> "TelemetryEvent":
        """Validate an event dictionary and return a ``TelemetryEvent`` instance.

        Args:
            event: Raw telemetry event as a dictionary.

        Raises:
            ValueError: If required fields are missing or malformed.
        """

        logger.debug("Validating telemetry event: %s", event)
        required_fields = ["event_type", "timestamp", "model_id"]
        missing = [field for field in required_fields if field not in event]
        if missing:
            raise ValueError(f"Missing required telemetry fields: {', '.join(missing)}")

        try:
            timestamp = (
                event["timestamp"]
                if isinstance(event["timestamp"], datetime)
                else datetime.fromisoformat(str(event["timestamp"]))
            )
        except Exception as exc:  # noqa: BLE001 - explicit conversion errors
            raise ValueError("Invalid timestamp format for telemetry event") from exc

        payload = event.get("payload", {})
        if payload is not None and not isinstance(payload, dict):
            raise ValueError("payload must be a dictionary if provided")

        partner = event.get("partner")
        if partner is not None and not isinstance(partner, str):
            raise ValueError("partner must be a string if provided")

        instance = cls(
            event_type=str(event["event_type"]),
            timestamp=timestamp,
            model_id=str(event["model_id"]),
            partner=partner,
            payload=payload,
        )
        logger.debug("Telemetry event validated: %s", instance)
        return instance


__all__ = ["TelemetryEvent"]
