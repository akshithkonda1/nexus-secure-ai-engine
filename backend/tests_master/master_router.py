import asyncio
import os

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.tests_master.master_runner import MasterRunner
from backend.tests_master.master_store import MasterStore
from backend.tests_master.warroom_logger import WarRoomLogger

router = APIRouter()
runner = MasterRunner()
store = MasterStore()
logger = WarRoomLogger()


@router.post("/run_all")
async def run_all_tests():
    run_id = await runner.run_all()
    return {"run_id": run_id, "status": "started"}


@router.get("/status/{run_id}")
async def get_status(run_id: str):
    status = store.get_status(run_id)
    return {"run_id": run_id, "status": status}


@router.get("/stream/{run_id}")
async def stream_logs(run_id: str):
    log_path = f"warroom/master/{run_id}.log"

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
