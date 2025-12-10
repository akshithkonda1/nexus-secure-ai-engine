from __future__ import annotations

import asyncio
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

from .master_runner import MasterRunner
from .master_store import TestStore

router = APIRouter()
runner = MasterRunner()
store: TestStore = runner.store


@router.post("/tests/run_all")
async def run_all_tests():
    run_id = str(uuid4())
    store.init_run(run_id)
    asyncio.create_task(runner.run_full_test(run_id))
    return {"run_id": run_id, "status": "started"}


@router.get("/tests/status/{run_id}")
async def get_status(run_id: str):
    status = store.get_status(run_id)
    return status


@router.get("/tests/stream/{run_id}")
async def stream_logs(run_id: str):
    queue = store.get_log_queue(run_id)
    if queue is None:
        raise HTTPException(status_code=404, detail="run_id not found")

    async def event_generator():
        while True:
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
