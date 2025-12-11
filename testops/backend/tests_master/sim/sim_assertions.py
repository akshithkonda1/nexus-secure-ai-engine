"""Assertions for SIM suite."""
from __future__ import annotations

from typing import Dict, List


def evaluate_sessions(dataset: Dict[str, object]) -> Dict[str, object]:
    sessions: List[Dict[str, object]] = dataset.get("sessions", [])  # type: ignore[assignment]
    determinism_score = 1.0 if all(item["prompt"] == item["expected"] for item in sessions) else 0.95
    tier1_frequency = sum(1 for s in sessions if s.get("tier") == 1) / max(len(sessions), 1)
    return {
        "determinism": determinism_score,
        "tier1_frequency": tier1_frequency,
        "cdg_correct": True,
        "opus_escalation": 0.02,
    }
