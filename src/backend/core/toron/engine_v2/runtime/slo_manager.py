"""
SLO Manager — Tracks:
- success rate over time
- latency percentiles
- error budget
- SLO violations

Exposes:
- record_success()
- record_failure()
- record_latency()
- check_slo()
"""

import time
from collections import deque


class SLOManager:
    def __init__(self, window_size=5000, target_success_rate=0.98, latency_slo_ms=2500):
        self.window_size = window_size
        self.success_window = deque(maxlen=window_size)
        self.latency_window = deque(maxlen=window_size)

        self.target_success_rate = target_success_rate
        self.latency_slo_ms = latency_slo_ms

    def record_success(self):
        self.success_window.append(1)

    def record_failure(self):
        self.success_window.append(0)

    def record_latency(self, ms: float):
        self.latency_window.append(ms)

    def success_rate(self):
        if not self.success_window:
            return 1.0
        return sum(self.success_window) / len(self.success_window)

    def latency_p95(self):
        if not self.latency_window:
            return 0
        sorted_latencies = sorted(self.latency_window)
        idx = int(0.95 * len(sorted_latencies)) - 1
        return sorted_latencies[max(idx, 0)]

    def check_slo(self):
        """Return whether Toron is performing inside SLO."""
        success_good = self.success_rate() >= self.target_success_rate
        latency_good = self.latency_p95() <= self.latency_slo_ms

        return {
            "success_rate": round(self.success_rate(), 4),
            "p95_latency": round(self.latency_p95(), 2),
            "success_ok": success_good,
            "latency_ok": latency_good,
            "slo_pass": success_good and latency_good,
        }
