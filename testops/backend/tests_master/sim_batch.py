"""SIM batch execution for Toron v2.5H+."""
from __future__ import annotations

import json
import random
import time
from pathlib import Path
from typing import Dict, List

from testops.backend.engine_adapter.adapter import EngineAdapter

BACKEND_ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_DIR = BACKEND_ROOT / "snapshots"
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)


async def run_sim_batch(run_id: str, adapter: EngineAdapter) -> Dict[str, object]:
    """Run deterministic SIM suites for 1k, 5k, and 10k prompts."""

    sizes = [1000, 5000, 10000]
    seed = sum(ord(c) for c in run_id)
    rng = random.Random(seed)
    results: List[Dict[str, object]] = []

    for size in sizes:
        prompt = f"SIM batch {size} prompts for run {run_id}"
        start = time.perf_counter()
        response = await adapter.run(prompt)
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        synthetic_checksum = rng.randint(10_000, 999_999)

        snapshot = {
            "run_id": run_id,
            "size": size,
            "prompt": prompt,
            "response": response.get("output"),
            "latency_ms": latency_ms,
            "checksum": synthetic_checksum,
            "timestamp": time.time(),
        }

        snapshot_path = SNAPSHOT_DIR / f"{run_id}_sim_{size}.json"
        with snapshot_path.open("w", encoding="utf-8") as handle:
            json.dump(snapshot, handle, indent=2)

        results.append(
            {
                "size": size,
                "success": response.get("success", False),
                "latency_ms": latency_ms,
                "snapshot": str(snapshot_path),
                "checksum": synthetic_checksum,
            }
        )

    return {"label": "sim_batch", "results": results, "snapshot_dir": str(SNAPSHOT_DIR)}


__all__ = ["run_sim_batch", "SNAPSHOT_DIR"]
