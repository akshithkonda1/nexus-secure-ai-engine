"""Tiered pipeline validation for Wave 3.

Evaluates structure and quality of outputs from T1/T2/T3 plus operational
signals. Returns a structured PIPELINE_STATUS payload for the reporter.
"""
from __future__ import annotations

from typing import Any, Dict, Iterable, List, Mapping

PIPELINE_STATUS = {
    "t1_ok": False,
    "t2_ok": False,
    "t3_ok": False,
    "opus_ok": False,
    "confidence_ok": False,
    "latency_ok": False,
    "notes": [],
}


def _validate_section(payload: Mapping[str, Any], expected_keys: List[str]) -> bool:
    return all(key in payload for key in expected_keys)


def _check_latency(latencies: List[float]) -> tuple[bool, str]:
    if not latencies:
        return False, "No latency samples provided"
    sorted_lat = sorted(latencies)
    idx = int(0.95 * (len(sorted_lat) - 1))
    p95 = sorted_lat[idx]
    if p95 > 450:
        return False, f"Latency anomaly detected (p95={p95:.2f}ms)"
    return True, f"Latency stable (p95={p95:.2f}ms)"


def run_checks(payload: Mapping[str, Any]) -> Dict[str, Any]:
    status = dict(PIPELINE_STATUS)
    notes: List[str] = []

    t1_payload = payload.get("t1", {})
    t2_payload = payload.get("t2", {})
    t3_payload = payload.get("t3", {})

    status["t1_ok"] = _validate_section(t1_payload, ["raw_outputs", "format"])
    if not status["t1_ok"]:
        notes.append("T1 raw output format missing fields")

    status["t2_ok"] = _validate_section(t2_payload, ["audit", "structure"])
    if not status["t2_ok"]:
        notes.append("T2 audit structure incomplete")

    status["t3_ok"] = _validate_section(t3_payload, ["evidence", "claims"])
    if not status["t3_ok"]:
        notes.append("T3 evidence structure incomplete")

    opus_escalations = payload.get("opus", {}).get("escalations", [])
    status["opus_ok"] = len(opus_escalations) <= 3
    if not status["opus_ok"]:
        notes.append("Opus escalation behavior exceeded threshold")

    contradictions = payload.get("contradictions", 0)
    confidence = payload.get("confidence", 0.0)
    status["confidence_ok"] = contradictions < 5 and 0.0 <= confidence <= 1.0
    if contradictions >= 5:
        notes.append("Contradiction density too high")
    if not (0.0 <= confidence <= 1.0):
        notes.append("Confidence value outside expected [0,1] range")

    latencies = payload.get("latencies", [])
    status["latency_ok"], latency_note = _check_latency(latencies)
    notes.append(latency_note)

    status["notes"] = notes
    return status


__all__ = ["PIPELINE_STATUS", "run_checks"]
