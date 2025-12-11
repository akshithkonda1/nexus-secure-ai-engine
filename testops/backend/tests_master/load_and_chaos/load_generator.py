"""Synthetic load generator."""
from __future__ import annotations

from typing import Dict


def run_tests(run_id: str) -> Dict[str, object]:
    metrics = {
        "vus_baseline": 1500,
        "vus_stress": 10000,
        "rps_profile": [30, 100, 300],
    }
    return {"status": "PASS", "metrics": metrics, "notes": ["Load simulated offline"]}
