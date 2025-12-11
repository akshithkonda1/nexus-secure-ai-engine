from __future__ import annotations

import io
import zipfile
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse

from backend.tests_master.master_runner import run_all
from backend.tests_master.master_sse import event_stream
from backend.tests_master.master_reporter import REPORT_DIR, SNAPSHOT_DIR
from backend.tests_master import master_store

router = APIRouter(prefix="/tests", tags=["tests"])


@router.post("/run_all")
async def run_all_endpoint(payload: dict | None = None) -> dict:
    run_id = await run_all(payload or {})
    return {"run_id": run_id}


@router.get("/status/{run_id}")
async def status(run_id: str) -> dict:
    record = master_store.get_run(run_id)
    if not record:
        raise HTTPException(status_code=404, detail="Run not found")
    return record


@router.get("/stream/{run_id}")
async def stream(run_id: str) -> StreamingResponse:
    return StreamingResponse(event_stream(run_id), media_type="text/event-stream")


@router.get("/result/{run_id}")
async def result(run_id: str) -> dict:
    record = master_store.get_run(run_id)
    if not record:
        raise HTTPException(status_code=404, detail="Run not found")
    return record.get("result_json", {})


@router.get("/report/{run_id}")
async def report(run_id: str) -> HTMLResponse:
    report_path = Path(REPORT_DIR) / f"report_{run_id}.html"
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not ready")
    return HTMLResponse(report_path.read_text())


@router.get("/bundle/{run_id}")
async def bundle(run_id: str) -> StreamingResponse:
    record = master_store.get_run(run_id)
    if not record:
        raise HTTPException(status_code=404, detail="Run not found")
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        snapshot_path = record.get("snapshot_path")
        report_path = record.get("report_path")
        if snapshot_path and Path(snapshot_path).exists():
            zf.write(snapshot_path, arcname=Path(snapshot_path).name)
        if report_path and Path(report_path).exists():
            zf.write(report_path, arcname=Path(report_path).name)
        log_dir = Path("backend/logs/master")
        for log_file in log_dir.glob(f"{run_id}*.log"):
            zf.write(log_file, arcname=log_file.name)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/zip", headers={"Content-Disposition": f"attachment; filename={run_id}.zip"})


@router.post("/run")
async def testops_run() -> dict:
    run_id = await run_all({})
    return {"run_id": run_id}
