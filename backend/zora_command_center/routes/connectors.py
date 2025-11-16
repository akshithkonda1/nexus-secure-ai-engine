from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..config import settings as app_settings
from ..schemas import ConnectorCreateRequest, ConnectorEntry
from ..services import connectors_service

router = APIRouter(prefix="/api/connectors", tags=["connectors"])


@router.get("", response_model=list[ConnectorEntry])
def get_connectors() -> list[ConnectorEntry]:
    return connectors_service.list_connectors(app_settings.default_user_id)


@router.post("/add", response_model=ConnectorEntry)
def add_connector(payload: ConnectorCreateRequest) -> ConnectorEntry:
    try:
        return connectors_service.add_connector(app_settings.default_user_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.patch("/{connector_id}/enable", response_model=ConnectorEntry)
def enable_connector(connector_id: str) -> ConnectorEntry:
    try:
        return connectors_service.set_connector_status(app_settings.default_user_id, connector_id, True)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/{connector_id}/disable", response_model=ConnectorEntry)
def disable_connector(connector_id: str) -> ConnectorEntry:
    try:
        return connectors_service.set_connector_status(app_settings.default_user_id, connector_id, False)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/{connector_id}", status_code=204)
def remove_connector(connector_id: str) -> None:
    try:
        connectors_service.delete_connector(app_settings.default_user_id, connector_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
