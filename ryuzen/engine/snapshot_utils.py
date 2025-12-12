"""Snapshot structure normalization utilities."""
from __future__ import annotations

from typing import Any, Dict, List


def normalize_snapshot(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    """Guarantee snapshot structure stays consistent across runs."""

    required_defaults = {
        "t1_raw": {},
        "t1_summary": {},
        "cdg_structure": {},
        "t2_audit_report": {},
        "reality_packet": {},
        "judicial_result": {},
        "rwl_result": {},
        "confidence_score": {},
        "aloe_policy": {},
        "meta_flags": {},
    }

    for key, default in required_defaults.items():
        if key not in snapshot or not snapshot.get(key):
            snapshot[key] = default

    return snapshot


__all__ = ["normalize_snapshot"]
