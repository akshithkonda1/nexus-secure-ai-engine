"""Telemetry recording primitives.

The recorder intentionally captures metadata about model orchestration without
persisting user content. This implementation is designed to be safe for use in
regulated environments and can easily be replaced with a more sophisticated
backend (for example CloudWatch, Firehose, or an internal metrics pipeline).
"""
from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, field
from typing import Dict, Iterable, Mapping, Optional

log = logging.getLogger(__name__)


@dataclass
class TelemetryEvent:
    """Structured telemetry payload containing no user content."""

    request_id: str
    session_id: str
    models: Iterable[str]
    latencies: Mapping[str, float]
    policy: Optional[str] = None
    disagreement: Optional[float] = None
    consensus: Optional[str] = None
    errors: Optional[Mapping[str, str]] = None
    extra: Dict[str, object] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, object]:
        payload: Dict[str, object] = {
            "request_id": self.request_id,
            "session_id": self.session_id,
            "models": list(self.models),
            "latencies": dict(self.latencies),
        }
        if self.policy is not None:
            payload["policy"] = self.policy
        if self.disagreement is not None:
            payload["disagreement"] = self.disagreement
        if self.consensus is not None:
            payload["consensus"] = self.consensus
        if self.errors:
            payload["errors"] = dict(self.errors)
        if self.extra:
            payload["extra"] = dict(self.extra)
        return payload


class TelemetryRecorder:
    """Best-effort telemetry logger.

    The recorder emits JSON payloads to the configured logger when telemetry is
    enabled. It is intentionally conservative and will never raise exceptions –
    telemetry must never impact the user facing request lifecycle.
    """

    def __init__(self, *, enabled: Optional[bool] = None) -> None:
        self._enabled = (
            enabled
            if enabled is not None
            else os.getenv("NEXUS_TELEMETRY_ENABLED", "1").lower() in {"1", "true", "yes"}
        )

    def record(self, event: TelemetryEvent) -> None:
        if not self._enabled:
            return
        try:
            log.info("telemetry.event", extra={"telemetry": json.dumps(event.to_dict())})
        except Exception:  # pragma: no cover - logging failures are non-fatal
            log.debug("telemetry_emit_failed", exc_info=True)

    def record_inference(
        self,
        *,
        request_id: str,
        session_id: str,
        models: Iterable[str],
        latencies: Mapping[str, float],
        policy: Optional[str] = None,
        disagreement: Optional[float] = None,
        consensus: Optional[str] = None,
        errors: Optional[Mapping[str, str]] = None,
        extra: Optional[Dict[str, object]] = None,
    ) -> None:
        event = TelemetryEvent(
            request_id=request_id,
            session_id=session_id,
            models=models,
            latencies=latencies,
            policy=policy,
            disagreement=disagreement,
            consensus=consensus,
            errors=errors,
            extra=extra or {},
        )
        self.record(event)


__all__ = ["TelemetryRecorder", "TelemetryEvent"]
