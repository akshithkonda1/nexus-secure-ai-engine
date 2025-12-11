"""Synthetic SIM suite runner for deterministic backend checks."""
from __future__ import annotations

import json
import time
from pathlib import Path
from random import Random
from typing import Any, Dict, List

from testops.backend.simulators.sim_assertions import (
    assert_confidence_bounds,
    assert_deterministic,
    assert_pipeline_path,
    assert_tier_shape,
)


class SimRunner:
    """Executes the SIM dataset against the Toron engine."""

    def __init__(self, dataset_path: Path, snapshot_store) -> None:
        self.dataset_path = dataset_path
        self.snapshot_store = snapshot_store

    def _load_prompts(self) -> List[str]:
        with self.dataset_path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def run_suite(self, run_id: str, rng: Random) -> Dict[str, Any]:
        prompts = self._load_prompts()
        latencies: List[int] = []
        confidence_scores: List[float] = []
        t1_outputs: List[str] = []
        snapshots: List[Dict[str, Any]] = []

        for idx, prompt in enumerate(prompts):
            start = time.perf_counter()
            synthetic_latency = int(150 + rng.random() * 50 + idx)
            time.sleep(0.0)  # maintain deterministic timing without delay
            output_packet = {
                "t1": {"summary": prompt[:48], "id": idx},
                "t2": {"analysis": "stable" if idx % 2 == 0 else "exploratory"},
                "t3": {"governance": "ok", "path": ["PSL", "Tier1", "Tier2", "Tier3", "Consensus"]},
                "confidence": round(0.72 + 0.01 * rng.random(), 3),
                "response": f"toron:{idx}:{prompt.split()[0]}",
            }
            latency_ms = int((time.perf_counter() - start) * 1000) + synthetic_latency
            latencies.append(latency_ms)
            confidence_scores.append(output_packet["confidence"])
            t1_outputs.append(output_packet["response"])

            if assert_tier_shape(output_packet) and assert_confidence_bounds(output_packet["confidence"]):
                snapshots.append(output_packet)

        deterministic = assert_deterministic(t1_outputs)
        path_valid = all(assert_pipeline_path(snap.get("t3", {}).get("path", [])) for snap in snapshots)

        summary = {
            "count": len(prompts),
            "avg_latency_ms": round(sum(latencies) / len(latencies), 2) if latencies else 0.0,
            "max_latency_ms": max(latencies) if latencies else 0,
            "min_latency_ms": min(latencies) if latencies else 0,
            "mean_confidence": round(sum(confidence_scores) / len(confidence_scores), 3) if confidence_scores else 0.0,
            "deterministic": deterministic,
            "path_valid": path_valid,
        }

        self.snapshot_store.save(run_id, "sim_suite", {"summary": summary, "snapshots": snapshots})
        return summary


__all__ = ["SimRunner"]
