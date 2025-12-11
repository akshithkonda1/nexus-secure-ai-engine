"""Simulated test execution suite."""
from __future__ import annotations

import asyncio
import json
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

from testops.backend.services.test_status import test_status_service
from testops.backend.utils.log_writer import write_log

SNAPSHOT_DIR = Path(__file__).resolve().parent.parent / "snapshots"
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)

# Deterministic seeding for reproducible outcomes
random.seed(42)


async def run_full_sim_suite(run_id: str) -> None:
    await _run_phase(run_id, "full_sim_suite", 0, 30)


async def run_load_test(run_id: str) -> None:
    await _run_phase(run_id, "load_test", 30, 60)


async def run_engine_validation(run_id: str) -> None:
    await _run_phase(run_id, "engine_validation", 60, 100, finalize=True)


async def _run_phase(run_id: str, phase: str, start_progress: int, end_progress: int, finalize: bool = False) -> None:
    try:
        write_log(run_id, f"Starting phase: {phase}")
        test_status_service.update_phase(run_id, phase=phase, progress=start_progress)
        steps = 5
        for step in range(1, steps + 1):
            await asyncio.sleep(0.2)
            progress = start_progress + int(((end_progress - start_progress) * step) / steps)
            write_log(run_id, f"{phase} step {step}/{steps} complete")
            test_status_service.update_phase(run_id, phase=phase, progress=progress)
        results = _generate_results(run_id, phase, end_progress)
        _write_snapshot(run_id, phase, results)
        if finalize:
            test_status_service.complete_run(run_id)
            write_log(run_id, "Run completed")
    except Exception as exc:  # pragma: no cover - defensive catch
        write_log(run_id, f"Error in phase {phase}: {exc}")
        test_status_service.fail_run(run_id, phase=phase)


def _generate_results(run_id: str, phase: str, progress: int) -> Dict[str, Any]:
    metrics = {
        "latency_ms": round(random.uniform(50, 150), 2),
        "throughput_rps": round(random.uniform(200, 500), 2),
        "error_rate": round(random.uniform(0, 0.05), 4),
    }
    return {
        "run_id": run_id,
        "phase": phase,
        "progress": progress,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "metrics": metrics,
    }


def _write_snapshot(run_id: str, phase: str, results: Dict[str, Any]) -> None:
    snapshot_path = SNAPSHOT_DIR / f"{run_id}.json"
    payload: Dict[str, Any]
    if snapshot_path.exists():
        payload = json.loads(snapshot_path.read_text(encoding="utf-8"))
    else:
        payload = {"run_id": run_id, "results": []}
    payload.setdefault("results", [])
    payload["last_phase"] = phase
    payload["results"].append(results)
    snapshot_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


__all__ = [
    "run_full_sim_suite",
    "run_load_test",
    "run_engine_validation",
]
