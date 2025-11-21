"""Telemetry aggregation utilities."""
from __future__ import annotations

import threading
import time
from collections import defaultdict
from typing import Dict


class TelemetryAggregator:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._counters: Dict[str, int] = defaultdict(int)
        self._latency: list[float] = []

    def record_inference(self, model_name: str, prompt: str, latency_ms: float) -> None:
        with self._lock:
            self._counters[model_name] += 1
            self._latency.append(latency_ms)

    def export_summary(self) -> Dict[str, float | int]:
        with self._lock:
            count = sum(self._counters.values())
            avg_latency = (sum(self._latency) / len(self._latency)) if self._latency else 0.0
            return {
                "total_requests": count,
                "average_latency_ms": round(avg_latency, 3),
                "per_model": dict(self._counters),
                "generated_at": time.time(),
            }

    def clear(self) -> None:
        with self._lock:
            self._counters.clear()
            self._latency.clear()
