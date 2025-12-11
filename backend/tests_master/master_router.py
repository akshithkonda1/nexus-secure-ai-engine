from __future__ import annotations

import asyncio
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

from backend.tests_master.engine_validator import validate_engine
from backend.tests_master.master_runner import MasterRunner
from backend.tests_master.master_store import MasterStore

router = APIRouter()
runner = MasterRunner()
store = MasterStore()


@router.post("/tests/run_all")
async def run_all_tests():
    run_id = await runner.start_run()
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
async def stream_logs(run_id: str):
    log_path = os.path.join("backend", "warroom", "master", f"{run_id}.log")

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
