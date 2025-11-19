from __future__ import annotations

from fastapi import APIRouter

from ..config import settings as app_settings
from ..schemas import EngineRequest, EngineResponse
from ..services import settings_service
from ..services.model_selector import select_model_for_task
from ..services.telemetry import telemetry_manager
from ..services.zora_engine import RyuzenEngine

router = APIRouter(prefix="/api/zora-engine", tags=["zora-engine"])
ENGINE = RyuzenEngine()


def _prepare_context(task_type: str, payload: dict) -> tuple[dict, str, dict, bool]:
    user_settings = settings_service.get_user_settings(app_settings.default_user_id)
    model_id = select_model_for_task(task_type, user_settings)
    behaviours = user_settings.get("zora", {}).get("behaviours", {})
    telemetry_enabled = user_settings.get("privacySecurity", {}).get("telemetryEnabled", False)
    return user_settings, model_id, behaviours, telemetry_enabled


@router.post("/analyze", response_model=EngineResponse)
def analyze(payload: EngineRequest) -> EngineResponse:
    user_settings, model_id, behaviours, telemetry_enabled = _prepare_context(payload.taskType, payload.payload)
    telemetry_manager.log(telemetry_enabled, "zora_engine_analyze", payload.payload)
    output = ENGINE.analyze(payload.taskType, payload.payload)
    return EngineResponse(model=model_id, taskType=payload.taskType, behaviours=behaviours, output=output)


@router.post("/summarize", response_model=EngineResponse)
def summarize(payload: EngineRequest) -> EngineResponse:
    user_settings, model_id, behaviours, telemetry_enabled = _prepare_context(payload.taskType, payload.payload)
    telemetry_manager.log(telemetry_enabled, "zora_engine_summarize", payload.payload)
    summary = ENGINE.summarize(payload.taskType, payload.payload)
    return EngineResponse(model=model_id, taskType=payload.taskType, behaviours=behaviours, output={"summary": summary})


@router.post("/chat", response_model=EngineResponse)
def chat(payload: EngineRequest) -> EngineResponse:
    user_settings, model_id, behaviours, telemetry_enabled = _prepare_context(payload.taskType, payload.payload)
    telemetry_manager.log(telemetry_enabled, "zora_engine_chat", payload.payload)
    output = ENGINE.chat(payload.taskType, payload.payload)
    return EngineResponse(model=model_id, taskType=payload.taskType, behaviours=behaviours, output=output)
