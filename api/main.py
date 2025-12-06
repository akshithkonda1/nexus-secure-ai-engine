"""FastAPI service layer for Toron Engine v2."""
from __future__ import annotations

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
from ryuzen.utils.toron_logger import get_logger

ROOT_DIR = Path(__file__).resolve().parent.parent
VERSION_FILE = ROOT_DIR / "VERSION"
ENGINE_VERSION = os.getenv("ENGINE_VERSION") or VERSION_FILE.read_text().strip()
ENGINE_HOST = os.getenv("ENGINE_HOST", "0.0.0.0")
ENGINE_PORT = int(os.getenv("ENGINE_PORT", "8000"))

logger = get_logger("toron.api")

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


def _ensure_engine_ready() -> ToronEngine:
    if not engine_ready or toron_engine is None:
        raise HTTPException(status_code=503, detail="Engine is not ready")
    if not toron_engine.initialized:
        raise HTTPException(status_code=503, detail="Engine is still initialising")
    return toron_engine


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

    try:
        toron_engine = ToronEngine()
        toron_engine.initialize()
        engine_ready = True
        logger.info("Toron Engine initialized and ready")
    except Exception as exc:
        engine_ready = False
        toron_engine = None
        logger.exception("Failed to initialize Toron Engine: %s", exc)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Flush logging handlers and release engine resources."""
    global toron_engine, engine_ready

    engine_ready = False
    toron_engine = None


@app.post("/generate")
async def generate(request: GenerateRequest):
    """Generate a Toron response for the provided prompt."""
    engine = _ensure_engine_ready()
    try:
        return await engine.generate(request.prompt)
    except RuntimeError as exc:
        logger.warning("Generate called before initialization: %s", exc)
        raise HTTPException(status_code=503, detail="Engine initialization incomplete") from exc
    except Exception as exc:
        logger.exception("Generation failed: %s", exc)
        raise HTTPException(status_code=500, detail="Generation failed") from exc


@app.get("/health")
async def health():
    """Return a basic health payload."""
    try:
        return {"status": "ok", "details": health_metadata(toron_engine)}
    except Exception as exc:
        logger.exception("Health check failed: %s", exc)
        raise HTTPException(status_code=500, detail="Health check failed") from exc


@app.get("/live")
async def live():
    """Liveness probe."""
    try:
        return {"alive": True}
    except Exception as exc:
        logger.exception("Live probe failed: %s", exc)
        raise HTTPException(status_code=500, detail="Unexpected error") from exc


@app.get("/ready")
async def ready():
    """Readiness probe that reflects engine initialization."""
    try:
        return {"ready": engine_ready and check_engine_loaded(toron_engine)}
    except Exception as exc:
        logger.exception("Ready probe failed: %s", exc)
        raise HTTPException(status_code=500, detail="Unexpected error") from exc


@app.get("/version")
async def version():
    """Return the running engine version."""
    try:
        return {"version": ENGINE_VERSION}
    except Exception as exc:
        logger.exception("Version endpoint failed: %s", exc)
        raise HTTPException(status_code=500, detail="Unexpected error") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.main:app", host=ENGINE_HOST, port=ENGINE_PORT, reload=False)
