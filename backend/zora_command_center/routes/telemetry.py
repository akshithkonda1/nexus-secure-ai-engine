from __future__ import annotations

from fastapi import APIRouter

from ..config import settings as app_settings
from ..schemas import TelemetryEvent
from ..services import settings_service
from ..services.telemetry import telemetry_manager

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])


@router.post("/event")
def log_event(payload: TelemetryEvent) -> dict:
    user_settings = settings_service.get_user_settings(app_settings.default_user_id)
    enabled = user_settings.get("privacySecurity", {}).get("telemetryEnabled", False)
    accepted = telemetry_manager.log(enabled, payload.eventType, payload.payload)
    return {"accepted": accepted}
