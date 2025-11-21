"""API routes for health monitoring."""
from __future__ import annotations

from fastapi import APIRouter

from src.backend.health.health_monitor import HealthMonitor

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health")
def health() -> dict:
    return HealthMonitor.status()
