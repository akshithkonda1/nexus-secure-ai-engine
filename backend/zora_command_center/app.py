from __future__ import annotations

from fastapi import FastAPI

from .routes import command_center, connectors, models, settings, telemetry, workspace, zora_engine
from .services.settings_service import create_all_tables

create_all_tables()

app = FastAPI(title="Zora Command Center", version="1.0.0")

app.include_router(settings.router)
app.include_router(models.router)
app.include_router(connectors.router)
app.include_router(command_center.router)
app.include_router(workspace.router)
app.include_router(telemetry.router)
app.include_router(zora_engine.router)


@app.get("/health")
def healthcheck() -> dict:
    return {"status": "ok"}
