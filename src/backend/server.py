"""ASGI FastAPI server for the Toron engine demo."""

from __future__ import annotations

import asyncio

import uvloop
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from backend.toron_v25hplus import router as toron_v25hplus_router
from toron import (
    CloudProviderAdapter,
    ConnectorRegistry,
    EngineConfig,
    PIIPipeline,
    Retriever,
    TokenBucket,
    ToronEngine,
)

uvloop.install()

app = FastAPI(title="Toron Engine", version="1.6")
app.include_router(toron_v25hplus_router)

engine: ToronEngine | None = None


async def _build_engine() -> ToronEngine:
    config = EngineConfig()
    return ToronEngine(
        config=config,
        connectors=ConnectorRegistry.default(),
        adapter=CloudProviderAdapter(),
        pii_pipeline=PIIPipeline(),
        retriever=Retriever(session=None),  # Session is injected during runtime usage
        rate_limiter=TokenBucket(capacity=100, fill_rate=10),
    )


@app.on_event("startup")
async def startup_event() -> None:
    global engine
    if engine is None:
        engine = await _build_engine()


@app.get("/health")
async def health() -> JSONResponse:
    assert engine is not None
    payload = await asyncio.to_thread(
        lambda: {"status": "ok", "version": engine.metadata.get("version", "1.6")}
    )
    return JSONResponse(content=payload)


@app.get("/bootstrap")
async def bootstrap() -> JSONResponse:
    assert engine is not None
    payload = await asyncio.to_thread(engine.bootstrap)
    return JSONResponse(content=payload)


def create_app() -> FastAPI:
    return app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.server:app",
        host="0.0.0.0",
        port=EngineConfig().port,
        factory=False,
        reload=False,
    )
