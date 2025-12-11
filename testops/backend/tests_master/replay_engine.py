"""Replay snapshots through Toron to validate determinism."""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Dict, List

from testops.backend.engine_adapter.adapter import EngineAdapter
from .sim_batch import SNAPSHOT_DIR


async def replay_snapshots(run_id: str, adapter: EngineAdapter) -> Dict[str, object]:
    snapshot_files = sorted(SNAPSHOT_DIR.glob(f"{run_id}_sim_*.json"))
    comparisons: List[Dict[str, object]] = []
    matches = 0
    total = 0

    for snapshot_file in snapshot_files:
        with snapshot_file.open("r", encoding="utf-8") as handle:
            snapshot = json.load(handle)
        prompt = snapshot.get("prompt", "")
        baseline = snapshot.get("response")
        start = time.perf_counter()
        replayed = await adapter.run(prompt)
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        total += 1
        is_match = str(replayed.get("output")) == str(baseline)
        matches += 1 if is_match else 0
        comparisons.append(
            {
                "snapshot": str(snapshot_file),
                "match": is_match,
                "latency_ms": latency_ms,
                "baseline_checksum": snapshot.get("checksum"),
                "replayed_output": replayed.get("output"),
            }
        )

    determinism_score = round(matches / total, 3) if total else 0.0
    return {
        "label": "replay_engine",
        "determinism_score": determinism_score,
        "comparisons": comparisons,
    }


__all__ = ["replay_snapshots"]
