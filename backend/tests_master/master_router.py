from __future__ import annotations

import asyncio
from typing import Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

from .engine_validator import validate_engine
from .master_runner import MasterRunner

router = APIRouter()


_queues: Dict[str, asyncio.Queue[str]] = {}


def get_log_queue(run_id: str) -> asyncio.Queue[str]:
    if run_id not in _queues:
        _queues[run_id] = asyncio.Queue()
    return _queues[run_id]


runner = MasterRunner(queue_factory=get_log_queue)
store = runner.store


@router.post("/tests/run_all")
@router.post("/run_all")
async def run_all_tests():
    run_id = await runner.start_run()
    get_log_queue(run_id).put_nowait(f"Run {run_id} accepted")
    return {"run_id": run_id, "status": "started"}


@router.get("/tests/status/{run_id}")
async def get_status(run_id: str):
    status = store.get_status(run_id)
    return status or {"error": "unknown run"}


@router.get("/validate_engine")
async def validate_engine_route():
    result = validate_engine()
    return result


@router.get("/tests/stream/{run_id}")
@router.get("/stream/{run_id}")
async def stream_logs(run_id: str):
    async def event_generator():
        while True:
            queue = get_log_queue(run_id)
            msg = await queue.get()
            yield f"data: {msg}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/tests/result/{run_id}")
async def get_result(run_id: str):
    return store.get_result(run_id)


@router.get("/tests/report/{run_id}")
async def get_report(run_id: str):
    path = store.get_report_path(run_id)
    return FileResponse(path)


@router.get("/tests/bundle/{run_id}")
async def get_bundle(run_id: str):
    path = store.build_bundle(run_id)
    return FileResponse(path)
