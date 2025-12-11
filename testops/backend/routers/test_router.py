"""Routes for running simulations and streaming test telemetry."""
from __future__ import annotations

import asyncio
import json
import uuid
from typing import Any, AsyncGenerator, Dict

from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse

from testops.backend.runners.engine_validator import validate_engine
from testops.backend.simulators.sim_runner import SimulationResult, run_simulation

router = APIRouter()

# In-memory state for lightweight orchestration
RUNS: Dict[str, Dict[str, Any]] = {}


def _ensure_run(run_id: str) -> Dict[str, Any]:
    if run_id not in RUNS:
        raise HTTPException(status_code=404, detail=f"run_id {run_id} not found")
    return RUNS[run_id]


def _publish_log(run_id: str, message: str) -> None:
    run_state = RUNS[run_id]
    log_entry = {"run_id": run_id, "message": message}
    run_state["logs"].append(log_entry)
    queue: asyncio.Queue = run_state["queue"]
    queue.put_nowait(log_entry)


async def _execute_run(run_id: str) -> None:
    RUNS[run_id]["status"] = "running"
    _publish_log(run_id, "Initializing synthetic Toron engine calls.")
    try:
        result: SimulationResult = await run_simulation(run_id, log_callback=lambda msg: _publish_log(run_id, msg))
        RUNS[run_id]["result"] = result
        RUNS[run_id]["status"] = "completed"
        _publish_log(run_id, "Simulation completed and assertions evaluated.")
    except Exception as exc:  # pragma: no cover - safety net
        RUNS[run_id]["status"] = "failed"
        RUNS[run_id]["result"] = {"error": str(exc)}
        _publish_log(run_id, f"Run failed: {exc}")
    finally:
        queue: asyncio.Queue = RUNS[run_id]["queue"]
        await queue.put({"run_id": run_id, "message": "__COMPLETE__"})


@router.get("/validate_engine")
async def validate_engine_route() -> Dict[str, Any]:
    """Validate synthetic engine readiness."""
    return validate_engine()


@router.post("/run_all")
async def run_all(background_tasks: BackgroundTasks) -> Dict[str, str]:
    """Trigger the full simulation suite asynchronously."""
    run_id = str(uuid.uuid4())
    RUNS[run_id] = {
        "status": "pending",
        "logs": [],
        "result": None,
        "queue": asyncio.Queue(),
    }
    background_tasks.add_task(_execute_run, run_id)
    return {"run_id": run_id, "status": "started"}


@router.get("/status/{run_id}")
async def status(run_id: str) -> Dict[str, Any]:
    """Return the current status and summary for a run."""
    run_state = _ensure_run(run_id)
    return {
        "run_id": run_id,
        "status": run_state["status"],
        "result": run_state.get("result"),
    }


async def _log_stream(run_id: str) -> AsyncGenerator[bytes, None]:
    run_state = _ensure_run(run_id)
    queue: asyncio.Queue = run_state["queue"]
    yield f"data: {json.dumps({'message': 'Log stream started', 'run_id': run_id})}\n\n".encode()
    while True:
        event = await queue.get()
        if event.get("message") == "__COMPLETE__":
            payload = json.dumps({"run_id": run_id, "status": run_state["status"]})
            yield b"event: end\n" + f"data: {payload}\n\n".encode()
            break
        yield f"data: {json.dumps(event)}\n\n".encode()


@router.get("/stream/{run_id}")
async def stream(run_id: str) -> StreamingResponse:
    """Stream log events as Server-Sent Events."""
    _ensure_run(run_id)
    return StreamingResponse(_log_stream(run_id), media_type="text/event-stream")
