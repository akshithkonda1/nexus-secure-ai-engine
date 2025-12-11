"""Synthetic data generator for SIM suite."""
from __future__ import annotations

from typing import Dict, List


def generate_sessions(seed: int = 42) -> List[Dict[str, object]]:
    return [
        {"id": f"seed-{seed}-1", "tier": 1, "prompt": "deterministic", "expected": "deterministic"},
        {"id": f"seed-{seed}-2", "tier": 2, "prompt": "stable", "expected": "stable"},
    ]
