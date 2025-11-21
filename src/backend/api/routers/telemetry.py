"""API routes for telemetry."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from src.backend.telemetry.telemetry_aggregator import TelemetryAggregator

router = APIRouter(prefix="/api/v1", tags=["telemetry"])


def get_aggregator(request: Request) -> TelemetryAggregator:
    return request.app.state.telemetry  # type: ignore[attr-defined]


@router.get("/telemetry/summary")
def telemetry_summary(aggregator: TelemetryAggregator = Depends(get_aggregator)) -> dict:
    return aggregator.export_summary()
