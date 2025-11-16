from __future__ import annotations

import copy
from datetime import datetime, timedelta
from typing import Any, Dict

from sqlalchemy import select

from ..config import settings as app_settings
from ..database import Base, engine, get_session
from ..models import Project, UpcomingItem, UserSettings
from ..schemas import (
    CommandCenterSettingsUpdate,
    PrivacySecuritySettingsUpdate,
    UserSettingsDocument,
    UserSettingsUpdate,
    WorkspaceSettingsUpdate,
    ZoraSettingsUpdate,
)


def create_all_tables() -> None:
    """Ensure database schema exists."""

    Base.metadata.create_all(bind=engine)


DEFAULT_SETTINGS = UserSettingsDocument(
    userId=app_settings.default_user_id,
).model_dump()


def deep_merge(base: Dict[str, Any], update: Dict[str, Any]) -> Dict[str, Any]:
    for key, value in update.items():
        if isinstance(value, dict) and isinstance(base.get(key), dict):
            base[key] = deep_merge(copy.deepcopy(base.get(key, {})), value)
        else:
            base[key] = value
    return base


def _ensure_user_settings(session, user_id: str) -> UserSettings:
    instance = session.get(UserSettings, user_id)
    if instance:
        return instance
    instance = UserSettings(user_id=user_id)
    instance.update_settings(DEFAULT_SETTINGS)
    session.add(instance)
    session.flush()
    seed_dummy_records(session, user_id)
    return instance


def seed_dummy_records(session, user_id: str) -> None:
    if not session.scalars(select(Project).where(Project.user_id == user_id)).first():
        session.add_all(
            [
                Project(
                    user_id=user_id,
                    name="Neural Atlas",
                    status="active",
                    description="Deploy sensors across the orbital ring.",
                ),
                Project(
                    user_id=user_id,
                    name="Atlas Retrofit",
                    status="blocked",
                    description="Waiting on compliance review for telemetry stack.",
                ),
            ]
        )
    if not session.scalars(select(UpcomingItem).where(UpcomingItem.user_id == user_id)).first():
        now = datetime.utcnow()
        session.add_all(
            [
                UpcomingItem(
                    user_id=user_id,
                    title="Launch weekly signal sweep",
                    due_at=now + timedelta(hours=6),
                    category="operations",
                    details="Coordinate with orbital uplink team.",
                ),
                UpcomingItem(
                    user_id=user_id,
                    title="Archive workspace artifacts",
                    due_at=now + timedelta(hours=20),
                    category="compliance",
                    details="Purge stale records older than retention policy.",
                ),
            ]
        )


def get_user_settings(user_id: str) -> Dict[str, Any]:
    with get_session() as session:
        instance = _ensure_user_settings(session, user_id)
        return instance.get_settings()


def update_settings(user_id: str, payload: UserSettingsUpdate) -> Dict[str, Any]:
    with get_session() as session:
        instance = _ensure_user_settings(session, user_id)
        current = instance.get_settings()
        updates = payload.model_dump(exclude_unset=True)
        merged = deep_merge(current, updates)
        instance.update_settings(merged)
        session.add(instance)
        return merged


def update_zora_settings(user_id: str, payload: ZoraSettingsUpdate) -> Dict[str, Any]:
    return update_settings(user_id, UserSettingsUpdate(zora=payload))


def update_workspace_settings(user_id: str, payload: WorkspaceSettingsUpdate) -> Dict[str, Any]:
    return update_settings(user_id, UserSettingsUpdate(workspace=payload))


def update_command_center_settings(
    user_id: str, payload: CommandCenterSettingsUpdate
) -> Dict[str, Any]:
    return update_settings(user_id, UserSettingsUpdate(commandCenter=payload))


def update_privacy_settings(user_id: str, payload: PrivacySecuritySettingsUpdate) -> Dict[str, Any]:
    return update_settings(user_id, UserSettingsUpdate(privacySecurity=payload))
