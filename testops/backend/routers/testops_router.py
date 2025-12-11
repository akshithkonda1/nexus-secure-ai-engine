import uuid
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from runners.master_runner import run_full_suite
from runners.master_status import status_store
from runners.master_logs import log_streamer
from runners.master_results import load_result

router = APIRouter()

@router.post("/run_all")
async def run_all():
    run_id = str(uuid.uuid4())
    asyncio.create_task(run_full_suite(run_id))
    return {"run_id": run_id, "status": "started"}

@router.get("/status/{run_id}")
async def status(run_id: str):
    return status_store.get(run_id, {"status": "unknown"})

@router.get("/stream/{run_id}")
async def stream(run_id: str):
    async def event_generator():
        async for line in log_streamer(run_id):
            yield f"data: {line}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/result/{run_id}")
async def result(run_id: str):
    return load_result(run_id)
