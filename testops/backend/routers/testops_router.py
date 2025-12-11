"""API routes for TestOps backend."""
from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from testops.backend.services.report_loader import load_report
from testops.backend.services.sse_stream import stream_logs
from testops.backend.services.test_runner import (
    run_engine_validation,
    run_full_sim_suite,
    run_load_test,
)
from testops.backend.services.test_status import test_status_service
from testops.backend.utils.id_generator import generate_run_id
from testops.backend.utils.log_writer import LOG_DIR, write_log

router = APIRouter(prefix="/testops", tags=["testops"])
SNAPSHOT_DIR = Path(__file__).resolve().parent.parent / "snapshots"
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)


async def _run_suite(run_id: str) -> None:
    await asyncio.gather(
        run_full_sim_suite(run_id),
        run_load_test(run_id),
        run_engine_validation(run_id),
    )


@router.post("/run")
async def start_run() -> Dict[str, str]:
    run_id = generate_run_id()
    test_status_service.start_run(run_id)
    write_log(run_id, "Run initialized")
    asyncio.create_task(_run_suite(run_id))
    return {"run_id": run_id, "status": "started"}


@router.get("/status/{run_id}")
async def get_status(run_id: str) -> Dict[str, Any]:
    run_state = test_status_service.get_status(run_id)
    if not run_state:
        raise HTTPException(status_code=404, detail="Run not found")
    return {
        "run_id": run_state.run_id,
        "phase": run_state.phase,
        "progress": run_state.progress,
        "started_at": run_state.started_at.isoformat(),
        "updated_at": run_state.updated_at.isoformat(),
    }


@router.get("/stream/{run_id}")
async def stream_run_logs(run_id: str):
    log_path = LOG_DIR / f"{run_id}.log"
    return stream_logs(log_path)


@router.get("/report/{run_id}")
async def get_report(run_id: str):
    return load_report(run_id)


@router.get("/snapshot/{run_id}")
async def get_snapshot(run_id: str) -> Dict[str, Any]:
    snapshot_path = SNAPSHOT_DIR / f"{run_id}.json"
    if not snapshot_path.exists():
        raise HTTPException(status_code=404, detail="Snapshot not found for run_id")
    return json.loads(snapshot_path.read_text(encoding="utf-8"))


__all__ = ["router"]
