"""FastAPI application for Ryuzen TestOps Suite backend."""
from __future__ import annotations

from pathlib import Path
from typing import Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from testops.backend.engine_adapter.healthcheck import run_healthcheck
from testops.backend.tests_master.master_router import router as master_router

BACKEND_ROOT = Path(__file__).resolve().parent

app = FastAPI(title="Ryuzen TestOps Suite", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.state.testing_unlocked = False


@app.on_event("startup")
async def ensure_directories() -> None:
    for path in [
        BACKEND_ROOT / "logs" / "master",
        BACKEND_ROOT / "reports" / "master",
        BACKEND_ROOT / "snapshots",
        BACKEND_ROOT / "load_results",
        BACKEND_ROOT / "warroom" / "master",
        BACKEND_ROOT / "database",
    ]:
        path.mkdir(parents=True, exist_ok=True)


@app.post("/begin")
async def begin(payload: Dict[str, str]):
    phrase = payload.get("phrase") if payload else None
    if phrase != "begin testing":
        raise HTTPException(status_code=403, detail="Invalid unlock phrase")
    app.state.testing_unlocked = True
    return {"status": "unlocked"}


@app.get("/engine_health")
async def engine_health():
    result = await run_healthcheck()
    if not result.get("engine_ok"):
        raise HTTPException(status_code=503, detail=result)
    return JSONResponse(content=result)


app.include_router(master_router)


__all__ = ["app"]
