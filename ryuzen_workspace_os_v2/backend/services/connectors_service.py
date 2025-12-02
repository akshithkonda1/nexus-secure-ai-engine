from typing import Dict, Any


def get_connector_status(user_id: str) -> Dict[str, Any]:
    return {
        "user_id": user_id,
        "google": "synced",
        "apple": "pending",
        "microsoft": "synced",
        "canvas": "not-configured",
        "notion": "synced",
        "meta": "pending",
    }
