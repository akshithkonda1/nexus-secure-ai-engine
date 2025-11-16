from __future__ import annotations

from fastapi import APIRouter

from ..config import settings as app_settings
from ..services import settings_service
from ..services.overview_service import build_overview

router = APIRouter(prefix="/api/command-center", tags=["command-center"])


@router.get("/overview")
def command_center_overview() -> dict:
    user_settings = settings_service.get_user_settings(app_settings.default_user_id)
    return build_overview(user_settings)
