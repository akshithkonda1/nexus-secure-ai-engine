"""API router for orchestrating TestOps backend runs."""
from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

from testops.backend.runners.engine_validator import EngineValidator
from testops.backend.runners.master_runner import MasterRunner, RunEventBus
from testops.backend.snapshots.snapshot_store import SnapshotStore
from testops.backend.warroom.warroom_logger import WarRoomLogger

router = APIRouter(prefix="/tests", tags=["tests"])

BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "db" / "testops.db"
CONFIG_PATH = BASE_DIR / "config" / "testops_config.yaml"
SNAPSHOT_STORE = SnapshotStore(BASE_DIR / "snapshots")
EVENT_BUS = RunEventBus()
WARROOM = WarRoomLogger(BASE_DIR / "warroom")
MASTER_RUNNER = MasterRunner(DB_PATH, CONFIG_PATH, SNAPSHOT_STORE, EVENT_BUS, WARROOM)


@router.post("/run_all")
async def run_all(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    run_id = await MASTER_RUNNER.start_run()
    background_tasks.add_task(asyncio.sleep, 0)
    return {"run_id": run_id, "status": "running"}


@router.get("/status/{run_id}")
async def run_status(run_id: str) -> Dict[str, Any]:
    record = MASTER_RUNNER.status(run_id)
    if not record:
        raise HTTPException(status_code=404, detail="run not found")
    return {
        "run_id": record.run_id,
        "status": record.status,
        "started_at": record.started_at,
        "ended_at": record.ended_at,
        "result_path": record.result_path,
        "report_path": record.report_path,
    }


@router.get("/stream/{run_id}")
async def run_stream(run_id: str) -> StreamingResponse:
    if not MASTER_RUNNER.status(run_id):
        raise HTTPException(status_code=404, detail="run not found")

    async def event_generator():
        queue = EVENT_BUS.subscribe(run_id)
        while True:
            event = await queue.get()
            yield f"data: {json.dumps(event)}\n\n"
            if event.get("final"):
                break

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/result/{run_id}")
async def run_result(run_id: str) -> Dict[str, Any]:
    record = MASTER_RUNNER.status(run_id)
    if not record:
        raise HTTPException(status_code=404, detail="run not found")
    result = MASTER_RUNNER.load_json(record.result_path)
    if result is None:
        raise HTTPException(status_code=404, detail="result not available")
    return result


@router.get("/report/{run_id}")
async def run_report(run_id: str) -> Dict[str, Any]:
    record = MASTER_RUNNER.status(run_id)
    if not record:
        raise HTTPException(status_code=404, detail="run not found")
    report = MASTER_RUNNER.load_json(record.report_path)
    if report is None:
        raise HTTPException(status_code=404, detail="report not available")
    return report


@router.get("/bundle/{run_id}")
async def run_bundle(run_id: str) -> Dict[str, Any]:
    if not MASTER_RUNNER.status(run_id):
        raise HTTPException(status_code=404, detail="run not found")
    bundle_paths = SNAPSHOT_STORE.bundle(run_id)
    payload = []
    for path in bundle_paths:
        payload.append({"name": path.name, "content": json.loads(path.read_text(encoding="utf-8"))})
    return {"run_id": run_id, "snapshots": payload}


@router.get("/bundle/{run_id}/download")
async def run_bundle_download(run_id: str):
    if not MASTER_RUNNER.status(run_id):
        raise HTTPException(status_code=404, detail="run not found")
    archive_path = BASE_DIR / "snapshots" / f"{run_id}_bundle.json"
    bundle_paths = SNAPSHOT_STORE.bundle(run_id)
    archive_payload = {path.name: json.loads(path.read_text(encoding="utf-8")) for path in bundle_paths}
    archive_path.write_text(json.dumps(archive_payload, indent=2, sort_keys=True), encoding="utf-8")
    return FileResponse(archive_path, media_type="application/json", filename=archive_path.name)


@router.get("/validate_engine")
async def validate_engine() -> Dict[str, Any]:
    validator = EngineValidator()
    return validator.validate()
