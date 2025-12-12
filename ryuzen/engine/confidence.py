"""Confidence smoothing helpers for Toron v2.5H+."""
from __future__ import annotations


def stabilized_confidence(contradiction_count: int, opus_escalation: bool) -> float:
    """Stabilized confidence curve with bounded deductions."""

    base = 82
    deductions = 0
    if contradiction_count > 3:
        deductions += 10
    if opus_escalation:
        deductions += 5

    confidence = max(60, base - deductions)
    return confidence


__all__ = ["stabilized_confidence"]
