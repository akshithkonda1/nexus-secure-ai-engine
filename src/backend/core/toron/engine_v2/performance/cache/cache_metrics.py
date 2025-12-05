"""Prometheus-style cache metrics counters."""

from collections import defaultdict
from typing import Dict
from threading import Lock


class CacheMetrics:
    def __init__(self):
        self._lock = Lock()
        self._counters: Dict[str, int] = defaultdict(int)

    def record_hit(self, layer: str):
        with self._lock:
            self._counters[f"{layer}_hits"] += 1

    def record_miss(self):
        with self._lock:
            self._counters["misses"] += 1

    def record_eviction(self):
        with self._lock:
            self._counters["evictions"] += 1

    def record_promotion(self, src: str, dst: str):
        with self._lock:
            self._counters["promotions"] += 1
            self._counters[f"promotion_{src}_to_{dst}"] += 1

    def snapshot(self) -> dict:
        with self._lock:
            return dict(self._counters)
