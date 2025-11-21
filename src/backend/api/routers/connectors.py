"""Connector management routes."""
from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/v1/connectors", tags=["connectors"])


class ConnectorsUnified:
    """Placeholder aggregation over external connectors."""

    @staticmethod
    def get_all_states() -> Dict[str, Any]:
        return {
            "providers": {
                "slack": {"status": "connected", "last_sync": "2024-01-01T00:00:00Z"},
                "notion": {"status": "pending", "last_sync": None},
            }
        }


class ConnectorSync:
    @staticmethod
    def sync_all() -> Dict[str, Any]:
        return {"synced": True, "timestamp": "2024-01-01T00:00:00Z"}


@router.get("")
async def list_connectors() -> JSONResponse:
    return JSONResponse(content=ConnectorsUnified.get_all_states())


@router.post("/sync")
async def sync_connectors() -> JSONResponse:
    return JSONResponse(content=ConnectorSync.sync_all())


@router.get("/{provider}/state")
async def connector_state(provider: str) -> JSONResponse:
    states = ConnectorsUnified.get_all_states().get("providers", {})
    if provider not in states:
        raise HTTPException(status_code=404, detail="Connector not found")
    return JSONResponse(content={"provider": provider, "state": states[provider]})

