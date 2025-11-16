from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..config import settings as app_settings
from ..schemas import DigestResponse
from ..services import digest_service

router = APIRouter(prefix="/api/workspace", tags=["workspace"])


@router.post("/digest/trigger", response_model=DigestResponse)
def trigger_digest() -> DigestResponse:
    try:
        return digest_service.trigger_digest(app_settings.default_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/digest/latest", response_model=DigestResponse)
def get_latest_digest() -> DigestResponse:
    try:
        return digest_service.latest_digest(app_settings.default_user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
