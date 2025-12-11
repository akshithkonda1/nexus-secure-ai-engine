from __future__ import annotations

import asyncio
import importlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List
from uuid import uuid4

from backend.tests_master.master_models import PhaseResult, RunStatus, StreamEvent, TestRun
from backend.tests_master.master_reporter import write_report, write_snapshot
from backend.tests_master.master_sse import sse_manager
from backend.tests_master import master_store

SNAPSHOT_DIR = Path("backend/snapshots")
REPORT_DIR = Path("backend/reports/master")
LOG_DIR = Path("backend/logs/master")
WARROOM_DIR = Path("backend/warroom/master")

for path in [SNAPSHOT_DIR, REPORT_DIR, LOG_DIR, WARROOM_DIR]:
    path.mkdir(parents=True, exist_ok=True)

PHASES = [
    ("sim", "backend.tests_master.sim_suite"),
    ("engine_hardening", "backend.tests_master.engine_hardening"),
    ("cloud_hardening", "backend.tests_master.cloud_hardening"),
    ("security_hardening", "backend.tests_master.security_hardening"),
    ("load_and_chaos", "backend.tests_master.load_and_chaos"),
    ("replay", "backend.tests_master.replay_suite"),
    ("beta_readiness", "backend.tests_master.beta_readiness"),
    ("public_beta", "backend.tests_master.public_beta"),
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _run_phase(run_id: str, name: str, module_path: str, engine, start_progress: int, end_progress: int) -> PhaseResult:
    module = importlib.import_module(module_path)
    progress_span = end_progress - start_progress
    logs: List[str] = []
    log_file = LOG_DIR / f"{run_id}.log"

    async def progress_callback(percent: float, message: str) -> None:
        overall = start_progress + percent * progress_span / 100
        event = StreamEvent(_now(), name, overall, "running", message)
        logs.append(f"[{event.timestamp}] {message}")
        await sse_manager.publish(run_id, event)
        master_store.append_log(run_id, event.timestamp, f"{name}: {message}")
        with log_file.open("a") as lf:
            lf.write(f"[{event.timestamp}] {name}: {message}\n")

    try:
        result = await module.run(engine, progress_callback)
        status = "PASS" if result.get("status", "PASS") == "PASS" else "FAIL"
        metrics = result.get("metrics", {})
        logs.extend(result.get("logs", []))
        await sse_manager.publish(run_id, StreamEvent(_now(), name, end_progress, status, f"{name} complete"))
        return PhaseResult(name=name, status=status, metrics=metrics, logs=logs)
    except Exception as exc:  # noqa: BLE001
        error_msg = f"{name} failed: {exc}"
        logs.append(error_msg)
        await sse_manager.publish(run_id, StreamEvent(_now(), name, end_progress, "FAIL", error_msg))
        master_store.append_log(run_id, _now(), error_msg)
        raise


async def run_all(config: Dict | None = None) -> str:
    run_id = str(uuid4())
    started_at = _now()
    run = TestRun(run_id=run_id, started_at=datetime.fromisoformat(started_at.replace("Z", "")), status=RunStatus.RUNNING)
    master_store.create_run(run_id, started_at)
    master_store.append_log(run_id, started_at, "Run initiated")
    (LOG_DIR / f"{run_id}.log").write_text(f"[{started_at}] Run initiated\n")

    from ryuzen.engine.toron_v25hplus import ToronEngine

    engine = ToronEngine()
    engine.validate()

    results: Dict[str, Dict] = {}
    progress_steps = [0, 12, 24, 36, 48, 60, 76, 88, 100]

    try:
        for idx, (name, module_path) in enumerate(PHASES):
            phase_result = await _run_phase(
                run_id,
                name,
                module_path,
                engine,
                progress_steps[idx],
                progress_steps[idx + 1],
            )
            results[name] = {
                "status": phase_result.status,
                "metrics": phase_result.metrics,
                "logs": phase_result.logs,
            }
    except Exception as exc:  # noqa: BLE001
        warroom_path = WARROOM_DIR / f"{run_id}.log"
        warroom_path.write_text(f"[{_now()}] {exc}\n")
        run.status = RunStatus.FAIL
        run.finished_at = datetime.now(timezone.utc)
        master_store.update_run(run_id, finished_at=run.finished_at.isoformat(), status=run.status.value, result_json=results)
        await sse_manager.close(run_id)
        return run_id

    run.status = RunStatus.PASS
    run.finished_at = datetime.now(timezone.utc)

    snapshot_path = write_snapshot(run_id, results)
    report_path = write_report(run_id, results)

    master_store.update_run(
        run_id,
        finished_at=run.finished_at.isoformat(),
        status=run.status.value,
        result_json=results,
        report_path=report_path,
        snapshot_path=snapshot_path,
    )

    await sse_manager.publish(run_id, StreamEvent(_now(), "master", 100, run.status.value, "Run complete"))
    await sse_manager.close(run_id)
    return run_id
