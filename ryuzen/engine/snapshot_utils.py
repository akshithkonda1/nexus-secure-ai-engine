"""Snapshot structure normalization utilities."""
from __future__ import annotations

from typing import Any, Dict, List


def normalize_snapshot(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    """Guarantee snapshot structure stays consistent across runs."""

    required = ["CDG_STRUCTURE", "tier_path", "confidence", "meta_flags"]

    for key in required:
        if key not in snapshot:
            if key == "CDG_STRUCTURE":
                snapshot[key] = {"nodes": [], "edges": []}
            elif key == "tier_path":
                snapshot[key] = []
            elif key == "confidence":
                snapshot[key] = 0
            elif key == "meta_flags":
                snapshot[key] = []

    return snapshot


__all__ = ["normalize_snapshot"]
