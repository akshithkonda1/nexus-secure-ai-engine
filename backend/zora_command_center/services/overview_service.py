from __future__ import annotations

from typing import Dict

from sqlalchemy import select

from ..config import settings
from ..database import get_session
from ..models import CommandCenterSignal, Connector, Project, UpcomingItem
from .model_selector import available_models_payload


def build_overview(user_settings: Dict) -> Dict:
    user_id = user_settings.get("userId", settings.default_user_id)
    with get_session() as session:
        projects = session.scalars(select(Project).where(Project.user_id == user_id)).all()
        upcoming = session.scalars(select(UpcomingItem).where(UpcomingItem.user_id == user_id)).all()
        signals = session.scalars(select(CommandCenterSignal).where(CommandCenterSignal.user_id == user_id)).all()
        connectors = session.scalars(select(Connector).where(Connector.user_id == user_id)).all()

    return {
        "projects": [
            {
                "id": project.id,
                "name": project.name,
                "status": project.status,
                "description": project.description,
                "updatedAt": project.updated_at.isoformat(),
            }
            for project in projects
        ],
        "upcoming": [
            {
                "id": item.id,
                "title": item.title,
                "dueAt": item.due_at.isoformat(),
                "category": item.category,
                "details": item.details,
            }
            for item in upcoming
        ],
        "signals": [
            {
                "id": signal.id,
                "priority": signal.priority,
                "content": signal.content,
                "createdAt": signal.created_at.isoformat(),
            }
            for signal in signals
        ]
        or [
            {
                "id": "seed-signal",
                "priority": "info",
                "content": "Zora Engine is ready to ingest workspace telemetry once enabled.",
                "createdAt": "",
            }
        ],
        "connectors": [
            {
                "id": connector.id,
                "type": connector.type,
                "enabled": connector.enabled,
                "lastSyncedAt": connector.last_synced_at.isoformat() if connector.last_synced_at else None,
            }
            for connector in connectors
        ],
        "modelRanking": user_settings.get("zora", {}).get("modelRanking", []),
        "modes": {
            "studyMode": user_settings.get("workspace", {}).get("studyMode", False),
            "safeMode": user_settings.get("zora", {}).get("behaviours", {}).get("safeMode", True),
            "dailyDigestEnabled": user_settings.get("workspace", {}).get("dailyDigestEnabled", True),
        },
        "telemetry": user_settings.get("privacySecurity", {}),
        "behaviours": user_settings.get("zora", {}).get("behaviours", {}),
        "workspace": user_settings.get("workspace", {}),
        "availableModels": available_models_payload(),
    }
