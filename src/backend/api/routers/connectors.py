"""API routes for connectors."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from src.backend.connectors.connectors_unified import ConnectorsUnified

router = APIRouter(prefix="/api/v1", tags=["connectors"])


def get_connectors(request: Request) -> ConnectorsUnified:
    return request.app.state.connectors  # type: ignore[attr-defined]


@router.get("/connectors")
def list_connectors(connectors: ConnectorsUnified = Depends(get_connectors)) -> dict:
    return connectors.get_all_states()


@router.post("/connectors/sync")
def sync_connectors(connectors: ConnectorsUnified = Depends(get_connectors)) -> dict:
    return connectors.sync_all()
