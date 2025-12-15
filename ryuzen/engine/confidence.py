"""Confidence smoothing helpers for Toron v2.5H+."""
from __future__ import annotations

def stabilized_confidence(
    contradiction_count: int, opus_escalation: bool, evidence_density: float = 0.5
) -> float:
    """
    Stabilized confidence curve with bounded deductions and research-aware boosts.

    The boost is capped to preserve determinism and avoids exceeding 100% confidence.
    """

    base = 82
    deductions = 0
    if contradiction_count > 3:
        deductions += 10
    if opus_escalation:
        deductions += 5

    base_confidence = max(60.0, base - deductions)
    bounded_density = min(max(evidence_density, 0.0), 1.0)
    research_boost = max(0.0, bounded_density - 0.5) * 20

    confidence = min(100.0, base_confidence + research_boost)
    return confidence


__all__ = ["stabilized_confidence"]
