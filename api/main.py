"""FastAPI service layer for Toron Engine v2."""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ryuzen.engine.health import check_engine_loaded, health_metadata
from ryuzen.engine.logging_middleware import EngineLoggingMiddleware
from ryuzen.engine.simulation_mode import SimulationMode
from ryuzen.engine.toron_engine import ToronEngine

logger = logging.getLogger("toron.api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")

ROOT_DIR = Path(__file__).resolve().parent.parent
VERSION_FILE = ROOT_DIR / "VERSION"
ENGINE_VERSION = os.getenv("ENGINE_VERSION") or VERSION_FILE.read_text().strip()

app = FastAPI(title="Toron Engine", version=ENGINE_VERSION)

allowed_origins = os.getenv("WORKSPACE_CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(EngineLoggingMiddleware)

toron_engine: Optional[ToronEngine] = None
engine_ready: bool = False


class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="User prompt for the Toron Engine")


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize simulation mode and preload the Toron engine."""
    global toron_engine, engine_ready

    SimulationMode.configure_from_env()
    if SimulationMode.is_enabled():
        SimulationMode.enable()
        logger.info("Simulation mode enabled via environment")
    else:
        SimulationMode.disable()
        logger.info("Simulation mode disabled via environment")

    toron_engine = ToronEngine()
    engine_ready = True
    logger.info("Toron Engine initialized and ready")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Flush logging handlers and release engine resources."""
    global toron_engine, engine_ready

    engine_ready = False
    toron_engine = None
    logging.shutdown()


@app.post("/generate")
async def generate(request: GenerateRequest):
    """Generate a Toron response for the provided prompt."""
    if not engine_ready or not check_engine_loaded(toron_engine):
        raise HTTPException(status_code=503, detail="Engine is not ready")

    assert toron_engine is not None
    result = await toron_engine.generate(request.prompt)
    return result


@app.get("/health")
async def health():
    """Return a basic health payload."""
    return {"status": "ok", "details": health_metadata(toron_engine)}


@app.get("/live")
async def live():
    """Liveness probe."""
    return {"alive": True}


@app.get("/ready")
async def ready():
    """Readiness probe that reflects engine initialization."""
    return {"ready": engine_ready}


@app.get("/version")
async def version():
    """Return the running engine version."""
    return {"version": ENGINE_VERSION}
