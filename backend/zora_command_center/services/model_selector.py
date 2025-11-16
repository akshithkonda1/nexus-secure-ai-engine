from __future__ import annotations

from typing import Dict, List

from ..schemas import AVAILABLE_MODELS


AVAILABLE_MODEL_STATUS = {
    model: {"status": "available", "latency": 220 + idx * 15}
    for idx, model in enumerate(AVAILABLE_MODELS)
}


def select_model_for_task(task_type: str, user_settings: Dict) -> str:
    ranking: List[str] = user_settings.get("zora", {}).get("modelRanking", AVAILABLE_MODELS[:10])
    behaviours = user_settings.get("zora", {}).get("behaviours", {})
    auto_choose = behaviours.get("autoChooseModel", True)
    if not auto_choose:
        return ranking[0]
    for model_id in ranking:
        status = AVAILABLE_MODEL_STATUS.get(model_id, {}).get("status", "maintenance")
        if status == "available":
            return model_id
    return AVAILABLE_MODELS[0]


def available_models_payload() -> List[Dict[str, int]]:
    return [
        {
            "id": model,
            "status": AVAILABLE_MODEL_STATUS.get(model, {}).get("status", "maintenance"),
            "latencyMs": AVAILABLE_MODEL_STATUS.get(model, {}).get("latency", 250),
        }
        for model in AVAILABLE_MODELS
    ]
