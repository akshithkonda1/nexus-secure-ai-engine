from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..config import settings as app_settings
from ..schemas import (
    PrivacySecuritySettingsUpdate,
    UserSettingsDocument,
    UserSettingsUpdate,
    WorkspaceSettingsUpdate,
    ZoraSettingsUpdate,
    CommandCenterSettingsUpdate,
)
from ..services import settings_service

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=UserSettingsDocument)
def get_settings() -> UserSettingsDocument:
    data = settings_service.get_user_settings(app_settings.default_user_id)
    return UserSettingsDocument(**data)


@router.patch("", response_model=UserSettingsDocument)
def patch_settings(payload: UserSettingsUpdate) -> UserSettingsDocument:
    data = settings_service.update_settings(app_settings.default_user_id, payload)
    return UserSettingsDocument(**data)


@router.patch("/zora", response_model=UserSettingsDocument)
def patch_zora(payload: ZoraSettingsUpdate) -> UserSettingsDocument:
    data = settings_service.update_zora_settings(app_settings.default_user_id, payload)
    return UserSettingsDocument(**data)


@router.patch("/workspace", response_model=UserSettingsDocument)
def patch_workspace(payload: WorkspaceSettingsUpdate) -> UserSettingsDocument:
    data = settings_service.update_workspace_settings(app_settings.default_user_id, payload)
    return UserSettingsDocument(**data)


@router.patch("/command-center", response_model=UserSettingsDocument)
def patch_command_center(payload: CommandCenterSettingsUpdate) -> UserSettingsDocument:
    data = settings_service.update_command_center_settings(app_settings.default_user_id, payload)
    return UserSettingsDocument(**data)


@router.patch("/privacy", response_model=UserSettingsDocument)
def patch_privacy(payload: PrivacySecuritySettingsUpdate) -> UserSettingsDocument:
    data = settings_service.update_privacy_settings(app_settings.default_user_id, payload)
    return UserSettingsDocument(**data)
