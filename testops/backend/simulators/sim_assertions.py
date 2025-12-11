"""Deterministic validation utilities for the SIM suite."""
from __future__ import annotations

from typing import Any, Dict, Iterable, List


def assert_deterministic(outputs: Iterable[str]) -> bool:
    first = None
    for item in outputs:
        if first is None:
            first = item
            continue
        if item != first:
            return False
    return True


def assert_tier_shape(packet: Dict[str, Any]) -> bool:
    required_keys = {"t1", "t2", "t3"}
    if not required_keys.issubset(packet.keys()):
        return False
    if not isinstance(packet["t1"], dict) or not isinstance(packet["t2"], dict):
        return False
    return isinstance(packet["t3"], dict)


def assert_confidence_bounds(confidence: float) -> bool:
    return 0.0 <= confidence <= 1.0


def assert_pipeline_path(path: List[str]) -> bool:
    if not path:
        return False
    return path[0] == "PSL" and path[-1] == "Consensus"


__all__ = [
    "assert_confidence_bounds",
    "assert_deterministic",
    "assert_pipeline_path",
    "assert_tier_shape",
]
