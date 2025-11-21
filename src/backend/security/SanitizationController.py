"""Orchestration layer that connects sanitization with engines and connectors."""
from __future__ import annotations

from typing import Any, Dict, Optional

from ..utils.Logging import SafeLogger
from ..utils.ErrorTypes import SanitizationError
from .RyuzenPIIRemovalPipeline import RyuzenPIIRemovalPipeline

logger = SafeLogger("sanitization-controller")


class SanitizationController:
    def __init__(self) -> None:
        self.pipeline = RyuzenPIIRemovalPipeline

    def sanitize_input(self, payload: Any, metadata: Optional[Dict[str, Any]] = None) -> str:
        logger.info("sanitize_input_invoked", has_metadata=bool(metadata))
        return self.pipeline.run(payload, metadata)

    def sanitize_output(self, payload: Any, metadata: Optional[Dict[str, Any]] = None) -> str:
        logger.info("sanitize_output_invoked", has_metadata=bool(metadata))
        return self.pipeline.run(payload, metadata)

    def sanitize_connector_metadata(self, connector_payload: Dict[str, Any]) -> Dict[str, Any]:
        sanitized = {}
        for key, value in connector_payload.items():
            sanitized[key] = self.pipeline.run(value)
        return sanitized

    def sanitize_telemetry(self, telemetry_payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            cleaned = {k: self.pipeline.run(v) for k, v in telemetry_payload.items()}
            return cleaned
        except Exception as exc:  # pragma: no cover
            logger.error("sanitize_telemetry_failed", error=str(exc))
            raise SanitizationError("Telemetry sanitization failed") from exc


__all__ = ["SanitizationController"]
