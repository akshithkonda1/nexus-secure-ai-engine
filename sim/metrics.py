"""Simulation metrics aggregator used by reporters and dashboards."""

from __future__ import annotations

from dataclasses import dataclass, asdict
from statistics import mean
from typing import Dict, List


@dataclass
class SimulationMetrics:
    p95_latency: float
    average_latency: float
    rps: float
    run_count: int
    failures: int

    @classmethod
    def from_latency_trace(cls, latencies: List[int], rps: float, failures: int) -> "SimulationMetrics":
        if not latencies:
            return cls(p95_latency=0.0, average_latency=0.0, rps=rps, run_count=0, failures=failures)
        sorted_latencies = sorted(latencies)
        index = int(len(sorted_latencies) * 0.95) - 1
        index = max(0, min(index, len(sorted_latencies) - 1))
        return cls(
            p95_latency=float(sorted_latencies[index]),
            average_latency=float(mean(sorted_latencies)),
            rps=rps,
            run_count=len(sorted_latencies),
            failures=failures,
        )

    def as_dict(self) -> Dict[str, float | int]:  # pragma: no cover - simple serializer
        return asdict(self)
