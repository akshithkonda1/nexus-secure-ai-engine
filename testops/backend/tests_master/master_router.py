"""API router exposing master test operations (excluding begin + health)."""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from sse_starlette.sse import EventSourceResponse

from .master_runner import master_runner

router = APIRouter()


async def require_unlocked(request: Request) -> None:
    if not getattr(request.app.state, "testing_unlocked", False):
        raise HTTPException(status_code=403, detail="Testing is locked. Call /begin first.")


@router.post("/run_all")
async def run_all(_: Any = Depends(require_unlocked)) -> Dict[str, str]:
    run_id = await master_runner.start_run("api_trigger")
    return {"run_id": run_id, "status": "started"}


@router.get("/status/{run_id}")
async def status(run_id: str, _: Any = Depends(require_unlocked)) -> Dict[str, Any]:
    current = master_runner.get_status(run_id)
    if not current:
        raise HTTPException(status_code=404, detail="run_id not found")
    return current


@router.get("/stream/{run_id}")
async def stream(run_id: str, _: Any = Depends(require_unlocked)):
    stream_generator = master_runner.stream(run_id)
    if stream_generator is None:
        raise HTTPException(status_code=404, detail="run_id not found")
    return EventSourceResponse(stream_generator)


@router.get("/result/{run_id}")
async def result(run_id: str, _: Any = Depends(require_unlocked)):
    payload = master_runner.get_results(run_id)
    if not payload:
        raise HTTPException(status_code=404, detail="results not found")
    return JSONResponse(content=payload)


@router.get("/report/{run_id}")
async def report(run_id: str, _: Any = Depends(require_unlocked)):
    reports = master_runner.get_report_paths(run_id)
    if not reports or not reports.get("html"):
        raise HTTPException(status_code=404, detail="report not found")
    html_path = Path(reports["html"])
    if not html_path.exists():
        raise HTTPException(status_code=404, detail="report artifact missing")
    return FileResponse(html_path)


@router.get("/bundle/{run_id}")
async def bundle(run_id: str, _: Any = Depends(require_unlocked)):
    reports = master_runner.get_report_paths(run_id)
    if not reports or not reports.get("bundle"):
        raise HTTPException(status_code=404, detail="bundle not found")
    bundle_path = Path(reports["bundle"])
    if not bundle_path.exists():
        raise HTTPException(status_code=404, detail="bundle artifact missing")
    return FileResponse(bundle_path, media_type="application/zip", filename=bundle_path.name)


__all__ = ["router"]
