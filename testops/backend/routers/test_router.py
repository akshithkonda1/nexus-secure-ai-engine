"""Test router exposing SSE and status endpoints for Section 2."""
from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from sse_starlette.sse import EventSourceResponse

from testops.backend.runners.master_runner import master_runner

router = APIRouter()


async def ensure_unlocked(request: Request) -> None:
    if not getattr(request.app.state, "testing_unlocked", False):
        raise HTTPException(status_code=403, detail="Testing is locked. Call /begin first.")


@router.post("/run", response_model=Dict[str, str])
async def start_run(_: Any = Depends(ensure_unlocked)) -> Dict[str, str]:
    run_id = await master_runner.start_run("router_trigger")
    return {"run_id": run_id, "status": "started"}


@router.get("/status/{run_id}")
async def status(run_id: str, _: Any = Depends(ensure_unlocked)) -> Dict[str, Any]:
    payload = master_runner.get_status(run_id)
    if not payload:
        raise HTTPException(status_code=404, detail="run_id not found")
    return payload


@router.get("/stream/{run_id}")
async def stream(run_id: str, _: Any = Depends(ensure_unlocked)) -> EventSourceResponse:
    stream_response = master_runner.stream(run_id)
    if stream_response is None:
        raise HTTPException(status_code=404, detail="run_id not found")
    return stream_response


@router.get("/result/{run_id}")
async def result(run_id: str, _: Any = Depends(ensure_unlocked)) -> Dict[str, Any]:
    payload = master_runner.get_results(run_id)
    if not payload:
        raise HTTPException(status_code=404, detail="results not found")
    return payload


__all__ = ["router"]
