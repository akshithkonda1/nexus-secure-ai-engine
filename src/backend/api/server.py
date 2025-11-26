"""FastAPI entrypoint for the Ryuzen Toron v1.6 Engine."""
from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI

from .middleware.cors import apply_cors
from .middleware.errors import apply_error_handling
from .middleware.ratelimit import apply_rate_limiting
from .routers import connectors, health, llm, projects, telemetry
from src.backend.toron.askToron import router as ToronRouter
from src.backend.feedback_system_v2.router import router as FeedbackRouter
from src.backend.feedback_system_v2.routes_admin import router as FeedbackAdminRouter

logger = logging.getLogger(__name__)


class EngineBootstrap:
    """Placeholder bootstrap hook for initializing the engine."""

    @staticmethod
    def build() -> Any:  # noqa: ANN401 - bootstrap may return any structure
        logger.info("EngineBootstrap.build invoked")
        return {"status": "initialized"}


def create_app() -> FastAPI:
    app = FastAPI(title="Ryuzen Toron v1.6 Engine API", version="1.6")

    apply_error_handling(app)
    apply_cors(app)
    apply_rate_limiting(app)

    app.include_router(llm.router)
    app.include_router(connectors.router)
    app.include_router(telemetry.router)
    app.include_router(projects.router)
    app.include_router(health.router)
    app.include_router(ToronRouter)
    app.include_router(FeedbackRouter, prefix="/api/v1")
    app.include_router(FeedbackAdminRouter, prefix="/api/v1")

    @app.on_event("startup")
    async def startup_event() -> None:
        EngineBootstrap.build()

    return app


app = create_app()

