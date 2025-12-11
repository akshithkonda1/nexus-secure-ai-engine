"""Phase 8 student usage simulator for controlled beta readiness."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple
import random


@dataclass
class SimulationConfig:
    """Configuration for student usage simulation runs."""

    seed: int = 42
    base_latency_ms: float = 320.0
    latency_jitter_ms: float = 45.0
    error_chance: float = 0.015
    escalation_threshold: float = 0.2


@dataclass
class SimulationResult:
    """Aggregated results for a simulation run."""

    scenario_counts: Dict[str, int]
    latency_samples_ms: List[float]
    error_rate: float
    model_escalations: int
    student_profile: Dict[str, float]


class StudentUsageSimulator:
    """Simulate representative student behaviors across prompt types."""

    scenarios: Tuple[str, ...] = (
        "STEM essays",
        "humanities summaries",
        "panic-night prompts",
        "tutoring requests",
        "exam prep prompts",
    )

    def __init__(self, config: SimulationConfig | None = None) -> None:
        self.config = config or SimulationConfig()
        self.random = random.Random(self.config.seed)

    def _simulate_latency(self) -> float:
        base = self.random.gauss(self.config.base_latency_ms, self.config.latency_jitter_ms)
        return max(80.0, round(base, 2))

    def _simulate_error(self) -> bool:
        return self.random.random() < self.config.error_chance

    def _simulate_escalation(self, latency_ms: float) -> bool:
        threshold = self.config.base_latency_ms * (1 + self.config.escalation_threshold)
        return latency_ms > threshold

    def run(self, total_requests: int = 500) -> SimulationResult:
        if total_requests <= 0:
            raise ValueError("total_requests must be positive")

        scenario_counts: Dict[str, int] = {scenario: 0 for scenario in self.scenarios}
        latency_samples: List[float] = []
        error_count = 0
        escalations = 0

        for _ in range(total_requests):
            scenario = self.random.choice(self.scenarios)
            scenario_counts[scenario] += 1

            latency_ms = self._simulate_latency()
            latency_samples.append(latency_ms)

            if self._simulate_error():
                error_count += 1

            if self._simulate_escalation(latency_ms):
                escalations += 1

        error_rate = round(error_count / total_requests, 4)
        escalation_rate = escalations / total_requests

        student_profile = {
            "total_requests": total_requests,
            "latency_p50_ms": _percentile(latency_samples, 50),
            "latency_p95_ms": _percentile(latency_samples, 95),
            "error_rate": error_rate,
            "model_escalation_frequency": round(escalation_rate, 4),
            **{f"share_{key.replace(' ', '_')}": count / total_requests for key, count in scenario_counts.items()},
        }

        return SimulationResult(
            scenario_counts=scenario_counts,
            latency_samples_ms=latency_samples,
            error_rate=error_rate,
            model_escalations=escalations,
            student_profile=student_profile,
        )


def _percentile(samples: List[float], percentile: float) -> float:
    if not samples:
        return 0.0
    ordered = sorted(samples)
    k = (len(ordered) - 1) * (percentile / 100)
    f = int(k)
    c = min(f + 1, len(ordered) - 1)
    if f == c:
        return round(ordered[int(k)], 2)
    d0 = ordered[f] * (c - k)
    d1 = ordered[c] * (k - f)
    return round(d0 + d1, 2)


__all__ = ["SimulationConfig", "SimulationResult", "StudentUsageSimulator"]
