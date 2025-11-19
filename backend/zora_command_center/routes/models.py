from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..config import settings as app_settings
from ..schemas import AvailableModel, ModelRankingRequest, UserSettingsDocument, ToronSettingsUpdate
from ..services import settings_service
from ..services.model_selector import available_models_payload

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("/available", response_model=list[AvailableModel])
def get_available_models() -> list[AvailableModel]:
    return available_models_payload()


@router.post("/ranking", response_model=UserSettingsDocument)
def update_model_ranking(payload: ModelRankingRequest) -> UserSettingsDocument:
    try:
        data = settings_service.update_zora_settings(
            app_settings.default_user_id, ToronSettingsUpdate(modelRanking=payload.modelRanking)
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return UserSettingsDocument(**data)
