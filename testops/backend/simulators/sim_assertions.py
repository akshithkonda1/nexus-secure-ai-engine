"""Assertion helpers for simulated Toron flows."""
from __future__ import annotations

from statistics import mean
from typing import Dict, List, Sequence

Metrics = Dict[str, List[Dict[str, float]]]


def evaluate_assertions(metrics: Metrics, dataset: Dict[str, object]) -> List[Dict[str, object]]:
    """Evaluate simple timing-based assertions against the dataset."""
    assertions: List[Dict[str, object]] = []
    responses: Sequence[Dict[str, float]] = metrics.get("responses", [])
    avg_latency = mean([r["ms"] for r in responses]) if responses else 0.0
    assertions.append(
        {
            "name": "average_latency_under_300ms",
            "status": avg_latency <= 300,
            "observed_ms": round(avg_latency, 2),
        }
    )

    for scenario in dataset.get("scenarios", []):
        threshold = scenario.get("threshold_ms", 0)
        step_latencies = [
            r["ms"]
            for r in responses
            if r.get("step") in {s.get("action") for s in scenario.get("steps", [])}
        ]
        scenario_avg = mean(step_latencies) if step_latencies else 0.0
        assertions.append(
            {
                "name": f"{scenario.get('name')}_within_threshold",
                "status": scenario_avg <= threshold if threshold else True,
                "observed_ms": round(scenario_avg, 2),
                "threshold_ms": threshold,
            }
        )
    return assertions


__all__ = ["evaluate_assertions", "Metrics"]
