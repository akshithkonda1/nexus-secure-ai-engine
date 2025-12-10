"""Deterministic SIM suite for Toron v2.5H+.

The functions here mirror the FastAPI control plane and return
repeatable payloads suitable for offline testing.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass
class SimCase:
    name: str
    expected_latency_ms: int
    deterministic_hash: str


DEFAULT_SIM_CASES: List[SimCase] = [
    SimCase(name="baseline", expected_latency_ms=120, deterministic_hash="sim-001"),
    SimCase(name="pii-redaction", expected_latency_ms=148, deterministic_hash="sim-002"),
    SimCase(name="throughput-flood", expected_latency_ms=210, deterministic_hash="sim-003"),
]


def run_suite(cases: List[SimCase] | None = None) -> Dict[str, object]:
    selected = cases or DEFAULT_SIM_CASES
    results = [
        {
            "scenario": case.name,
            "latency_ms": case.expected_latency_ms,
            "deterministic_hash": case.deterministic_hash,
            "status": "passed",
        }
        for case in selected
    ]
    return {
        "summary": "SIM suite executed",
        "count": len(results),
        "results": results,
    }
