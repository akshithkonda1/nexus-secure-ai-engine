"""Telemetry routes exposing aggregated metrics."""
from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/v1/telemetry", tags=["telemetry"])


class TelemetryAggregator:
    @staticmethod
    def export_summary() -> Dict[str, Any]:
        return {
            "requests": 0,
            "errors": 0,
            "avg_latency_ms": 0,
        }

    @staticmethod
    def model_metrics() -> List[Dict[str, Any]]:
        return [
            {
                "provider": "toron",
                "model": "rt-v1.6-base",
                "latency_ms_p50": 120,
                "latency_ms_p95": 220,
                "drift_score": 0.02,
                "rate_limit_pressure": 0.1,
            }
        ]


@router.get("/summary")
async def telemetry_summary() -> JSONResponse:
    return JSONResponse(content=TelemetryAggregator.export_summary())


@router.get("/models")
async def telemetry_models() -> JSONResponse:
    return JSONResponse(content=TelemetryAggregator.model_metrics())

