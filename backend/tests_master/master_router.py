import asyncio
import os

from fastapi import APIRouter
from fastapi.responses import FileResponse, StreamingResponse

from backend.tests_master.engine_validator import validate_engine
from backend.tests_master.master_runner import MasterRunner, store

router = APIRouter()
runner = MasterRunner()


@router.post("/run_all")
async def run_all_tests():
    run_id = await runner.run_all()
    return {"run_id": run_id, "status": "started"}


@router.get("/status/{run_id}")
async def get_status(run_id: str):
    status = store.get_status(run_id)
    result = store.get_result(run_id) or {}
    return {"run_id": run_id, "status": status, "result": result}


@router.get("/history")
async def get_history():
    return {"runs": store.list_runs()}


@router.get("/results/{run_id}")
async def get_results(run_id: str):
    result = store.get_result(run_id) or {}
    return {"run_id": run_id, "result": result}


@router.get("/warroom/{run_id}")
async def warroom_events(run_id: str):
    events = store.get_warroom_events(run_id)
    return {"run_id": run_id, "events": events}


@router.get("/reports/{run_id}")
async def fetch_report(run_id: str):
    report_path = os.path.join("reports", "master", f"{run_id}.html")
    if not os.path.exists(report_path):
        return {"error": "report missing"}
    return FileResponse(report_path, media_type="text/html")


@router.get("/validate_engine")
async def validate_engine_route():
    result = validate_engine()
    return result


@router.get("/stream/{run_id}")
async def stream_logs(run_id: str):
    log_path = f"warroom/master/{run_id}.log"

    async def event_stream():
        last_size = 0
        while True:
            if os.path.exists(log_path):
                with open(log_path, "r", encoding="utf-8") as f:
                    f.seek(last_size)
                    chunk = f.read()
                    last_size = f.tell()
                if chunk:
                    for line in chunk.splitlines():
                        yield f"data: {line}\n\n"

            await asyncio.sleep(0.25)

    return StreamingResponse(event_stream(), media_type="text/event-stream")
