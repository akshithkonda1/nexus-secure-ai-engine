import asyncio
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from testops_backend.core import store
from .master_runner import runner
from .master_store import broker

router = APIRouter(prefix="/tests", tags=["tests"])


def _stream_events(run_id: str):
    queue = broker.get_stream(run_id)

    async def event_generator():
        while True:
            event = await queue.get()
            if event is None:
                break
            payload = f"data: {event.timestamp} [{event.level}] {event.message}\n\n"
            yield payload

    return event_generator


@router.post("/run_all")
async def run_all():
    run_id = str(uuid4())
    broker.create_stream(run_id)
    asyncio.create_task(runner.run_all(run_id))
    return {"run_id": run_id}


@router.get("/status/{run_id}")
async def status(run_id: str):
    run = store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="run not found")
    return run


@router.get("/stream/{run_id}")
async def stream(run_id: str):
    run = store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="run not found")
    generator = _stream_events(run_id)
    return StreamingResponse(generator(), media_type="text/event-stream")


@router.get("/result/{run_id}")
async def result(run_id: str):
    payload = store.get_result(run_id)
    if not payload:
        raise HTTPException(status_code=404, detail="result not found")
    return payload


@router.get("/report/{run_id}")
async def report(run_id: str):
    payload = store.get_result(run_id)
    if not payload:
        raise HTTPException(status_code=404, detail="result not found")
    report_path = payload["artifacts"].get("report_html")
    if not report_path:
        raise HTTPException(status_code=404, detail="report not ready")
    return FileResponse(report_path)


@router.get("/bundle/{run_id}")
async def bundle(run_id: str):
    payload = store.get_result(run_id)
    if not payload:
        raise HTTPException(status_code=404, detail="result not found")
    return payload


@router.get("/history")
async def history():
    return store.get_runs()
