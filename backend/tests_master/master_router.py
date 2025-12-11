import asyncio
import os

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.tests_master.engine_validator import validate_engine
from backend.tests_master.master_runner import MasterRunner
from backend.tests_master.master_store import MasterStore

router = APIRouter()
runner = MasterRunner()
store = MasterStore()


@router.post("/run_all")
async def run_all_tests():
    run_id = await runner.start_run()
    return {"run_id": run_id, "status": "started"}


@router.get("/status/{run_id}")
async def get_status(run_id: str):
    status = store.get_status(run_id)
    return status or {"error": "unknown run"}


@router.get("/validate_engine")
async def validate_engine_route():
    result = validate_engine()
    return result


@router.get("/stream/{run_id}")
async def stream_logs(run_id: str):
    log_path = os.path.join("backend", "warroom", "master", f"{run_id}.log")

    async def event_stream():
        last_size = 0
        while True:
            if os.path.exists(log_path):
                with open(log_path, "r") as f:
                    f.seek(last_size)
                    chunk = f.read()
                    last_size = f.tell()
                if chunk:
                    yield f"data: {chunk}\n\n"

            await asyncio.sleep(0.25)

    return StreamingResponse(event_stream(), media_type="text/event-stream")
