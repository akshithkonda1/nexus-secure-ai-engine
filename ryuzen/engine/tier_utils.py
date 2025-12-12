"""Tier routing helpers for Toron v2.5H+."""
from __future__ import annotations

from typing import Any, List


def should_escalate_to_opus(t2_stability: float, contradiction_count: int) -> bool:
    """
    Controlled escalation that only triggers on real contradictions.
    """

    if contradiction_count == 0:
        return False
    if t2_stability < 0.65:
        return True
    return False


def normalized_pipeline(ep: Any) -> List[str]:
    """Ensure tier routing is predictable and ordered."""

    path = ["T1", "T2", "T3"]
    if getattr(ep, "use_opus", False):
        path.append("T4")
    return path


__all__ = ["normalized_pipeline", "should_escalate_to_opus"]
