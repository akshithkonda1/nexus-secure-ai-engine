"""Telemetry recorder restricted to model-level metadata only.

This module intentionally avoids collecting *any* user provided content. The
recorded payloads are limited to model level operational signals so they can be
forwarded to monitoring systems without risking sensitive data disclosure.
"""
from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field
from typing import Dict, Optional

log = logging.getLogger(__name__)


@dataclass
class TelemetryEvent:
    """Structured metadata describing the behaviour of a single model call."""

    model_name: str
    latency_ms: Optional[float] = None
    failure_type: Optional[str] = None
    hallucination_score: Optional[float] = None
    disagreement: Optional[float] = None
    token_usage: Optional[int] = None
    timestamp: float = field(default_factory=lambda: time.time())
    debate_metadata: Dict[str, object] = field(default_factory=dict)
    extra: Dict[str, object] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, object]:
        payload: Dict[str, object] = {"model_name": self.model_name, "timestamp": self.timestamp}
        if self.latency_ms is not None:
            payload["latency_ms"] = float(self.latency_ms)
        if self.failure_type is not None:
            payload["failure_type"] = self.failure_type
        if self.hallucination_score is not None:
            payload["hallucination_score"] = float(self.hallucination_score)
        if self.disagreement is not None:
            payload["disagreement"] = float(self.disagreement)
        if self.token_usage is not None:
            payload["token_usage"] = int(self.token_usage)
        if self.debate_metadata:
            payload["debate_metadata"] = dict(self.debate_metadata)
        if self.extra:
            payload["extra"] = dict(self.extra)
        return payload


class TelemetryRecorder:
    """Best-effort recorder that never captures user supplied content."""

    def __init__(self, *, enabled: bool = False) -> None:
        self._enabled = bool(enabled)

    @property
    def enabled(self) -> bool:
        return self._enabled

    def record_model_behavior(
        self,
        *,
        model_name: str,
        latency_ms: Optional[float] = None,
        failure_type: Optional[str] = None,
        hallucination_score: Optional[float] = None,
        disagreement: Optional[float] = None,
        token_usage: Optional[int] = None,
        timestamp: Optional[float] = None,
        debate_metadata: Optional[Dict[str, object]] = None,
        extra: Optional[Dict[str, object]] = None,
    ) -> None:
        if not self._enabled:
            return
        event = TelemetryEvent(
            model_name=model_name,
            latency_ms=latency_ms,
            failure_type=failure_type,
            hallucination_score=hallucination_score,
            disagreement=disagreement,
            token_usage=token_usage,
            timestamp=timestamp if timestamp is not None else time.time(),
            debate_metadata=dict(debate_metadata or {}),
            extra=dict(extra or {}),
        )
        self._emit(event)

    def _emit(self, event: TelemetryEvent) -> None:
        try:
            log.info("telemetry.model_behavior", extra={"telemetry": json.dumps(event.to_dict())})
        except Exception:  # pragma: no cover - telemetry failures must be silent
            log.debug("telemetry_emit_failed", exc_info=True)


__all__ = ["TelemetryRecorder", "TelemetryEvent"]
