"""FastAPI service layer for Toron Engine v2.5h+ Production."""
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
from ryuzen.engine import ToronEngineV31Enhanced
from ryuzen.utils.toron_logger import get_logger

ROOT_DIR = Path(__file__).resolve().parent.parent
VERSION_FILE = ROOT_DIR / "VERSION"
ENGINE_VERSION = os.getenv("ENGINE_VERSION") or VERSION_FILE.read_text().strip()
ENGINE_HOST = os.getenv("ENGINE_HOST", "0.0.0.0")
ENGINE_PORT = int(os.getenv("ENGINE_PORT", "8000"))

logger = get_logger("toron.api")

app = FastAPI(title="Toron Engine", version=ENGINE_VERSION)

# Production CORS - allow app.ryuzen.ai
allowed_origins = os.getenv(
    "WORKSPACE_CORS_ORIGINS",
    "https://app.ryuzen.ai,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(EngineLoggingMiddleware)

toron_engine: Optional[ToronEngineV31Enhanced] = None
engine_ready: bool = False


class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="User prompt for the Toron Engine")


class QueryRequest(BaseModel):
    """Request for TORON epistemic query."""
    prompt: str = Field(..., description="User query")
    user_id: Optional[str] = Field(None, description="Optional user ID for telemetry")
    session_id: Optional[str] = Field(None, description="Optional session ID for telemetry")
    use_cache: bool = Field(True, description="Whether to use cache")


def _ensure_engine_ready() -> ToronEngineV31Enhanced:
    if not engine_ready or toron_engine is None:
        raise HTTPException(status_code=503, detail="Engine is not ready")
    if not toron_engine._initialized:
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
        toron_engine = ToronEngineV31Enhanced()
        toron_engine.initialize()  # Now loads real providers from AWS Secrets Manager
        engine_ready = True
        logger.info("Toron Engine v2.5h+ initialized and ready")
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
        consensus, metrics = await engine.generate(request.prompt)
        return {
            "consensus": consensus.representative_output,
            "model": consensus.representative_model,
            "confidence": consensus.avg_confidence,
            "grade": consensus.output_grade.value,
        }
    except RuntimeError as exc:
        logger.warning("Generate called before initialization: %s", exc)
        raise HTTPException(status_code=503, detail="Engine initialization incomplete") from exc
    except Exception as exc:
        logger.exception("Generation failed: %s", exc)
        raise HTTPException(status_code=500, detail="Generation failed") from exc


@app.post("/query")
async def query(request: QueryRequest):
    """
    TORON epistemic query endpoint.

    Returns consensus from 12 AI models with epistemic rigor.
    """
    engine = _ensure_engine_ready()

    try:
        consensus, metrics = await engine.generate(
            prompt=request.prompt,
            use_cache=request.use_cache,
            user_id=request.user_id,
            session_id=request.session_id
        )

        return {
            "consensus": {
                "output": consensus.representative_output,
                "model": consensus.representative_model,
                "confidence": consensus.avg_confidence,
                "calibrated_confidence": consensus.calibrated_confidence,
                "source_weighted_confidence": consensus.source_weighted_confidence,
                "agreement": f"{consensus.agreement_count}/{consensus.total_responses}",
                "quality": consensus.consensus_quality.value,
                "grade": consensus.output_grade.value,
                "evidence_strength": consensus.evidence_strength,
                "arbitration_source": consensus.arbitration_source.value,
                "arbitration_model": consensus.arbitration_model,
                "uncertainty_flags": consensus.uncertainty_flags,
            },
            "metrics": {
                "request_id": metrics.request_id,
                "latency_ms": metrics.total_latency_ms,
                "providers_called": metrics.providers_called,
                "providers_failed": metrics.providers_failed,
                "cache_hit": metrics.cache_hits > 0,
                "tier_retries": metrics.tier_retries,
                "tier_timeouts": metrics.tier_timeouts,
                "degradation_level": metrics.degradation_level,
                "tier4_failsafe_triggered": metrics.tier4_failsafe_triggered,
            }
        }

    except Exception as exc:
        logger.exception("Query failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Query failed: {str(exc)}") from exc


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
