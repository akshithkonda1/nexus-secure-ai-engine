"""FastAPI router exposing the master test suite endpoints."""
from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any, AsyncGenerator, Dict
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse

from .master_models import RunStatus, TestProgress
from .master_runner import run_master_suite
from .master_store import REPORT_DIR, WARROOM_DIR, get_run, get_summary_json

router = APIRouter(prefix="/tests", tags=["tests"])

_tasks: Dict[str, asyncio.Task] = {}
_progress_channels: Dict[str, "asyncio.Queue[str]"] = {}


async def _progress_publisher(run_id: str, progress: TestProgress) -> None:
    queue = _progress_channels.get(run_id)
    if queue:
        await queue.put(json.dumps(progress.dict()))


@router.post("/run_all")
async def run_all() -> Dict[str, Any]:
    run_id = str(uuid4())
    queue: asyncio.Queue[str] = asyncio.Queue()
    _progress_channels[run_id] = queue

    async def runner():
        try:
            await run_master_suite(run_id, lambda progress: _progress_publisher(run_id, progress))
        finally:
            await queue.put("[DONE]")

    task = asyncio.create_task(runner())
    _tasks[run_id] = task
    return {"run_id": run_id, "status": RunStatus.STARTED.value}


async def _status_stream(run_id: str) -> AsyncGenerator[bytes, None]:
    if run_id not in _progress_channels:
        existing = get_run(run_id)
        if not existing:
            yield f"event: error\ndata: {{\"error\": \"unknown run_id\"}}\n\n".encode()
            return
        status = existing[1]
        percent = existing[2]
        yield f"data: {{\"run_id\": \"{run_id}\", \"status\": \"{status}\", \"percent\": {percent}}}\n\n".encode()
        return

    queue = _progress_channels[run_id]
    while True:
        message = await queue.get()
        if message == "[DONE]":
            summary = get_summary_json(run_id)
            payload = json.dumps({"run_id": run_id, "status": "completed", "summary": summary or {}})
            yield f"data: {payload}\n\n".encode()
            return
        yield f"data: {message}\n\n".encode()


@router.get("/status/{run_id}")
async def stream_status(run_id: str) -> StreamingResponse:
    return StreamingResponse(_status_stream(run_id), media_type="text/event-stream")


@router.get("/result/{run_id}")
async def get_result(run_id: str) -> JSONResponse:
    summary = get_summary_json(run_id)
    if not summary:
        run_row = get_run(run_id)
        if not run_row:
            raise HTTPException(status_code=404, detail="run_id not found")
        return JSONResponse({"run_id": run_row[0], "status": run_row[1], "percent": run_row[2]})
    return JSONResponse(summary)


@router.get("/report/{run_id}/html")
async def download_html_report(run_id: str) -> FileResponse:
    html_path = REPORT_DIR / f"{run_id}.html"
    if not html_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(html_path, media_type="text/html", filename=f"{run_id}.html")


@router.get("/report/{run_id}/json")
async def download_json_report(run_id: str) -> FileResponse:
    json_path = REPORT_DIR / f"{run_id}.json"
    if not json_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(json_path, media_type="application/json", filename=f"{run_id}.json")


@router.get("/warroom/{run_id}")
async def download_warroom_log(run_id: str) -> FileResponse:
    log_path = WARROOM_DIR / f"{run_id}_errors.log"
    if not log_path.exists():
        raise HTTPException(status_code=404, detail="WAR ROOM log not found")
    return FileResponse(log_path, media_type="text/plain", filename=f"{run_id}_errors.log")


__all__ = ["router"]
