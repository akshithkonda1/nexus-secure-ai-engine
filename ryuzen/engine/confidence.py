"""Confidence smoothing helpers for Toron v2.5H+."""
from __future__ import annotations


def stabilized_confidence(base_score: float, contradiction_count: int) -> float:
    """Smooth confidence so it does not swing violently."""

    penalty = contradiction_count * 5
    base_score = max(20, min(100, base_score - penalty))
    return base_score


__all__ = ["stabilized_confidence"]
