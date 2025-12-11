"""Stability analytics for Toron simulation outputs."""
from __future__ import annotations

import math
from typing import Any, Dict, List


def _percentile(values: List[float], percentile: float) -> float:
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    k = (len(sorted_vals) - 1) * percentile
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return float(sorted_vals[int(k)])
    d0 = sorted_vals[int(f)] * (c - k)
    d1 = sorted_vals[int(c)] * (k - f)
    return float(d0 + d1)


def _grade(instability_index: float) -> str:
    thresholds = [
        (0.05, "A+"),
        (0.10, "A"),
        (0.15, "B"),
        (0.20, "C"),
        (0.30, "D"),
    ]
    for limit, grade in thresholds:
        if instability_index <= limit:
            return grade
    return "F"


def analyze_stability(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    latencies = [float(entry.get("latency_ms", 0)) for entry in results]
    contradictions = [int(entry.get("contradiction_count", 0)) for entry in results]
    escalations = [1 for entry in results if entry.get("opus_used")]

    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
    p95_latency = _percentile(latencies, 0.95)
    contradiction_rate = sum(1 for c in contradictions if c > 0) / len(contradictions) if contradictions else 0.0
    escalation_rate = sum(escalations) / len(results) if results else 0.0

    instability_index = round((contradiction_rate * 0.6) + (escalation_rate * 0.3) + (p95_latency / 10_000), 4)
    stability_grade = _grade(instability_index)

    return {
        "average_latency_ms": round(avg_latency, 3),
        "p95_latency_ms": round(p95_latency, 3),
        "contradiction_frequency": round(contradiction_rate, 4),
        "escalation_frequency": round(escalation_rate, 4),
        "instability_index": instability_index,
        "stability_grade": stability_grade,
    }


__all__ = ["analyze_stability"]
