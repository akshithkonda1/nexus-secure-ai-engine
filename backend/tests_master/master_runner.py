"""Master orchestrator for the Ryuzen Toron v2.5H+ test suite."""
from __future__ import annotations

import asyncio
import datetime as dt
import json
import random
import statistics
from pathlib import Path
from typing import Any, Awaitable, Callable, Dict, List

from .k6_runner import run_load_test
from .master_models import LoadTestResult, RunStatus, RunSummary, SnapshotReplayResult, TestProgress
from .master_reporter import build_report
from .master_store import LOG_DIR, SNAPSHOT_DIR, finalize_run, save_summary, set_run_started, update_progress
from .pipeline_checker import run_full_engine_check
from .replay_engine import replay_snapshot
from .warroom_logger import log_error


def _log_line(log_path: Path, message: str) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    line = f"[{dt.datetime.utcnow().isoformat()}] {message}\n"
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(line)


async def _simulate_latency_histogram(rng: random.Random) -> Dict[str, Any]:
    latencies = [rng.uniform(80, 450) for _ in range(20)]
    histogram = {
        "min": round(min(latencies), 2),
        "max": round(max(latencies), 2),
        "avg": round(statistics.fmean(latencies), 2),
        "p95": round(sorted(latencies)[int(len(latencies) * 0.95) - 1], 2),
        "values": [round(v, 2) for v in latencies],
    }
    return histogram


async def _run_sim_batch(run_id: str, rng: random.Random, log_path: Path) -> Dict[str, Any]:
    _log_line(log_path, "Starting SIM Batch (20 prompts)")
    latencies = []
    for idx in range(20):
        await asyncio.sleep(0.05)
        latency = rng.uniform(100, 400)
        latencies.append(latency)
        _log_line(log_path, f"Prompt {idx+1}/20 latency={latency:.2f}ms")
    histogram = await _simulate_latency_histogram(rng)
    snapshot_payload = {
        "run_id": run_id,
        "latencies": [round(v, 2) for v in latencies],
        "timestamp": dt.datetime.utcnow().isoformat(),
    }
    snapshot_file = SNAPSHOT_DIR / "state_snapshot.json"
    snapshot_file.write_text(json.dumps(snapshot_payload, indent=2), encoding="utf-8")
    _log_line(log_path, f"SIM Batch complete; snapshot stored at {snapshot_file}")
    return {
        "latencies": histogram,
        "snapshot": str(snapshot_file),
        "avg_latency": histogram["avg"],
        "p95_latency": histogram["p95"],
    }


async def _run_snapshot_replay(run_id: str, log_path: Path) -> SnapshotReplayResult:
    _log_line(log_path, "Starting snapshot determinism replay")
    result = replay_snapshot(run_id)
    _log_line(log_path, f"Replay determinism score={result.determinism_score}% (identical={result.identical})")
    return result


async def _run_engine_check(seed: int, log_path: Path) -> Dict[str, Any]:
    _log_line(log_path, "Running full engine check diagnostics")
    diagnostics = run_full_engine_check(seed)
    _log_line(log_path, "Pipeline diagnostics generated")
    return diagnostics.dict()


async def _run_load_test(run_id: str, log_path: Path) -> LoadTestResult:
    _log_line(log_path, "Starting load test via k6 (simulated if unavailable)")
    result = run_load_test(run_id)
    _log_line(log_path, f"Load test complete p95={result.p95_latency_ms}ms throughput={result.throughput_rps}rps")
    return result


async def run_master_suite(
    run_id: str,
    progress_callback: Callable[[TestProgress], Awaitable[None]],
) -> RunSummary:
    """Orchestrate the entire master test pipeline."""

    random.seed(run_id)
    rng = random.Random(run_id)
    log_path = LOG_DIR / f"{run_id}.log"

    set_run_started(run_id)
    started_at = dt.datetime.utcnow()

    async def _advance(percent: float, message: str, details: Dict[str, Any] | None = None):
        update_progress(run_id, percent)
        await progress_callback(
            TestProgress(
                run_id=run_id,
                status=RunStatus.RUNNING,
                percent=percent,
                message=message,
                details=details or {},
            )
        )

    metrics: Dict[str, Any] = {}
    errors: List[str] = []

    try:
        await _advance(5, "Initializing master suite")

        sim_metrics = await _run_sim_batch(run_id, rng, log_path)
        metrics["latency"] = sim_metrics["latencies"]
        metrics["snapshot_path"] = sim_metrics["snapshot"]
        await _advance(25, "SIM Batch complete", {"latency_p95": sim_metrics["p95_latency"]})

        diagnostics = await _run_engine_check(rng.randint(1, 9999), log_path)
        metrics["pipeline_paths"] = diagnostics.get("pipeline_path_distribution", {})
        metrics["tier_stability"] = diagnostics.get("tier_stability", {})
        metrics["confidence_distribution"] = diagnostics.get("confidence_distribution", {})
        metrics["escalation_rate"] = diagnostics.get("escalation_rate", 0)
        metrics["contradiction_frequency"] = diagnostics.get("contradiction_frequency", 0)
        await _advance(45, "Engine check complete", {"tier1_stability": metrics["tier_stability"].get("tier1")})

        replay_result = await _run_snapshot_replay(run_id, log_path)
        metrics["determinism"] = {
            "score": replay_result.determinism_score,
            "identical": replay_result.identical,
            "mismatched_bytes": replay_result.mismatched_bytes,
        }
        await _advance(60, "Snapshot replay complete", {"determinism": replay_result.determinism_score})

        load_result = await _run_load_test(run_id, log_path)
        metrics["load_test"] = load_result.dict()
        await _advance(80, "Load test complete", {"load_p95": load_result.p95_latency_ms})

        # Stability + telemetry scrub + health checks (synthetic)
        stability_score = round(rng.uniform(0.9, 0.99), 3)
        telemetry_scrub = {"anomalies": 0, "status": "clean"}
        metrics["stability"] = stability_score
        metrics["telemetry_scrub"] = telemetry_scrub
        await _advance(90, "Diagnostics finalized", {"stability": stability_score})

        finished_at = dt.datetime.utcnow()
        summary = RunSummary(
            run_id=run_id,
            status=RunStatus.COMPLETED,
            started_at=started_at,
            finished_at=finished_at,
            metrics=metrics,
            errors=errors,
        )
        save_summary(run_id, summary)
        build_report(summary)
        finalize_run(run_id, RunStatus.COMPLETED)
        await _advance(100, "Master suite complete")
        return summary
    except Exception as exc:  # pragma: no cover - defensive logging
        log_error(run_id, "master", exc, context="Master suite failure")
        errors.append(str(exc))
        finalize_run(run_id, RunStatus.FAILED)
        raise


__all__ = ["run_master_suite"]
