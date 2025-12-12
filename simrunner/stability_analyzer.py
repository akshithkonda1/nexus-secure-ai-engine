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
        (0.10, "A+"),
        (0.20, "A"),
        (0.35, "B"),
        (0.55, "C"),
        (0.75, "D"),
    ]
    for limit, grade in thresholds:
        if instability_index <= limit:
            return grade
    return "F"


def _collect_meta_flags(entry: Dict[str, Any]) -> List[str]:
    collected: List[str] = []
    for key in ("meta_surveillance_flags", "meta_flags", "flags"):
        value = entry.get(key)
        if value is None:
            continue
        if isinstance(value, list):
            collected.extend([str(v) for v in value])
        else:
            collected.append(str(value))
    return collected


def _is_instability_meta_flag(flag: str) -> bool:
    lowered = flag.lower()
    if any(exclusion in lowered for exclusion in ("opus_escalation", "audit_notice", "info")):
        return False
    return any(keyword in lowered for keyword in ("error", "failure", "instability"))


def analyze_stability(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    latencies = [float(entry.get("latency_ms", 0)) for entry in results]
    contradictions = [int(entry.get("contradiction_count", 0)) for entry in results]
    total_runs = len(results)

    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
    p95_latency = _percentile(latencies, 0.95)

    total_contradictions = sum(contradictions)
    contradiction_rate = total_contradictions / total_runs if total_runs else 0.0

    opus_runs = sum(1 for entry in results if entry.get("opus_used"))
    opus_escalation_rate = opus_runs / total_runs if total_runs else 0.0

    instability_meta_runs = sum(
        1
        for entry in results
        if any(_is_instability_meta_flag(flag) for flag in _collect_meta_flags(entry))
    )
    meta_flag_rate = instability_meta_runs / total_runs if total_runs else 0.0

    scoring_modes = {
        "CONSUMER_STABILITY": {
            "p95_latency_ms": 750,
            "opus_escalation_rate": 0.35,
            "contradiction_rate": 0.20,
            "meta_flag_rate": 0.15,
        },
        "EPISTEMIC_RIGOR": {
            "p95_latency_ms": 600,
            "opus_escalation_rate": 0.25,
            "contradiction_rate": 0.15,
            "meta_flag_rate": 0.10,
        },
    }

    def _penalty(metric: float, threshold: float) -> int:
        return 1 if metric > threshold else 0

    def _instability_for_mode(thresholds: Dict[str, float]) -> float:
        latency_penalty = _penalty(p95_latency, thresholds["p95_latency_ms"])
        opus_penalty = _penalty(opus_escalation_rate, thresholds["opus_escalation_rate"])
        contradiction_penalty = _penalty(contradiction_rate, thresholds["contradiction_rate"])
        meta_penalty = _penalty(meta_flag_rate, thresholds["meta_flag_rate"])
        return round(
            (latency_penalty * 0.30)
            + (opus_penalty * 0.25)
            + (contradiction_penalty * 0.25)
            + (meta_penalty * 0.20),
            4,
        )

    consumer_index = _instability_for_mode(scoring_modes["CONSUMER_STABILITY"])
    epistemic_index = _instability_for_mode(scoring_modes["EPISTEMIC_RIGOR"])

    return {
        "average_latency_ms": round(avg_latency, 3),
        "p95_latency_ms": round(p95_latency, 3),
        "contradiction_rate": round(contradiction_rate, 4),
        "contradiction_frequency": round(contradiction_rate, 4),
        "opus_escalation_rate": round(opus_escalation_rate, 4),
        "escalation_frequency": round(opus_escalation_rate, 4),
        "meta_flag_rate": round(meta_flag_rate, 4),
        "instability_index": consumer_index,
        "stability_grade": _grade(consumer_index),
        "consumer_instability_index": consumer_index,
        "consumer_stability_grade": _grade(consumer_index),
        "epistemic_instability_index": epistemic_index,
        "epistemic_rigor_grade": _grade(epistemic_index),
    }


__all__ = ["analyze_stability"]
