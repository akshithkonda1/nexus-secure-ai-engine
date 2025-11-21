"""Health endpoints."""
from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/v1", tags=["health"])


class HealthMonitor:
    @staticmethod
    def status() -> dict:
        return {"status": "ok"}


@router.get("/health")
async def health() -> JSONResponse:
    return JSONResponse(content=HealthMonitor.status())

