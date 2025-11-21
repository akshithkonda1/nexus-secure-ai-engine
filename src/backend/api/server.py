"""FastAPI gateway for the Toron backend."""
from __future__ import annotations

import logging
from typing import Callable

from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.backend.api.routers import connectors, health, llm, telemetry
from src.backend.connectors.connectors_unified import ConnectorsUnified
from src.backend.core.toron.engine.debate_engine import DebateEngine
from src.backend.core.toron.engine.model_router import ModelRouter
from src.backend.core.toron.engine.orchestrator import Orchestrator
from src.backend.core.toron.engine.toron_engine import ToronEngine
from src.backend.rate_limit.concurrency_gate import ConcurrencyGate
from src.backend.rate_limit.global_rate_limiter import GlobalRateLimiter
from src.backend.rate_limit.user_rate_limiter import UserRateLimiter
from src.backend.security.aes256_engine import AES256Engine
from src.backend.security.pii_sanitizer import PiiSanitizer
from src.backend.telemetry.telemetry_aggregator import TelemetryAggregator

logger = logging.getLogger("toron.api")
logging.basicConfig(level=logging.INFO)


def create_app() -> FastAPI:
    app = FastAPI(title="Ryuzen Toron v1.6", version="1.6.0")

    # Components
    telemetry_aggregator = TelemetryAggregator()
    connectors_service = ConnectorsUnified()
    model_router = ModelRouter()
    orchestrator = Orchestrator(telemetry_aggregator)
    debate_engine = DebateEngine()
    global_rate_limiter = GlobalRateLimiter()
    user_rate_limiter = UserRateLimiter()
    concurrency_gate = ConcurrencyGate()
    toron_engine = ToronEngine(
        router=model_router,
        orchestrator=orchestrator,
        debate_engine=debate_engine,
        global_rate_limiter=global_rate_limiter,
        user_rate_limiter=user_rate_limiter,
        concurrency_gate=concurrency_gate,
    )
    aes_engine = AES256Engine()
    pii_sanitizer = PiiSanitizer()

    app.state.toron_engine = toron_engine
    app.state.telemetry = telemetry_aggregator
    app.state.connectors = connectors_service
    app.state.aes_engine = aes_engine
    app.state.pii_sanitizer = pii_sanitizer
    app.state.global_rate_limiter = global_rate_limiter
    app.state.user_rate_limiter = user_rate_limiter

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    @app.middleware("http")
    async def rate_limit(request: Request, call_next: Callable):  # type: ignore[override]
        try:
            app.state.global_rate_limiter.check()
        except RuntimeError as exc:
            return JSONResponse(status_code=429, content={"detail": str(exc)})
        try:
            response = await call_next(request)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Request processing failed: %s", exc)
            return JSONResponse(status_code=500, content={"detail": "internal_error"})
        return response

    @app.middleware("http")
    async def trace_requests(request: Request, call_next: Callable):  # type: ignore[override]
        logger.info("%s %s", request.method, request.url.path)
        response = await call_next(request)
        response.headers["X-Trace-Id"] = request.headers.get("X-Request-Id", "toron")
        return response

    app.include_router(llm.router)
    app.include_router(connectors.router)
    app.include_router(telemetry.router)
    app.include_router(health.router)

    @app.websocket("/ws/stream")
    async def websocket_stream(websocket: WebSocket):
        await websocket.accept()
        try:
            prompt = await websocket.receive_text()
            engine: ToronEngine = app.state.toron_engine
            for token in engine.stream_tokens(prompt):
                await websocket.send_text(token)
            await websocket.send_json({"done": True})
        except Exception as exc:  # noqa: BLE001
            await websocket.send_json({"error": str(exc)})
        finally:
            await websocket.close()

    @app.on_event("startup")
    async def warmup():  # pragma: no cover
        toron_engine.warmup()
        logger.info("Toron engine warmed up")

    return app


app = create_app()
