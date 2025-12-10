"""Offline telemetry helpers for Toron v2.5H+."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List


@dataclass
class TelemetryRecord:
    signal: str
    value: float
    captured_at: str


class TelemetryBuffer:
    def __init__(self) -> None:
        self._records: List[TelemetryRecord] = []

    def record(self, signal: str, value: float) -> TelemetryRecord:
        entry = TelemetryRecord(signal=signal, value=value, captured_at=datetime.utcnow().isoformat())
        self._records.append(entry)
        return entry

    def scrub(self) -> Dict[str, str]:
        count = len(self._records)
        self._records.clear()
        return {"status": "scrubbed", "cleared": count}

    def quarantine(self, reason: str, signals: List[str]) -> Dict[str, object]:
        quarantined = [r for r in self._records if r.signal in signals]
        return {"status": "quarantined", "reason": reason, "count": len(quarantined)}


telemetry_buffer = TelemetryBuffer()

__all__ = ["TelemetryBuffer", "TelemetryRecord", "telemetry_buffer"]
