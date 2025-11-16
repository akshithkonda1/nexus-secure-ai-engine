from __future__ import annotations

import hashlib
from datetime import datetime
from typing import List, Optional

from sqlalchemy import select

from ..database import get_session
from ..models import Connector
from ..schemas import CONNECTOR_TYPES, ConnectorCreateRequest, ConnectorEntry


class TokenVault:
    """Very small placeholder for storing sensitive connector tokens."""

    @staticmethod
    def _mask(value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
        return digest

    @classmethod
    def encrypt(cls, token: Optional[str]) -> Optional[str]:
        return cls._mask(token)


SUPPORTED_TYPES = set(CONNECTOR_TYPES)


def list_connectors(user_id: str) -> List[ConnectorEntry]:
    with get_session() as session:
        rows = session.scalars(select(Connector).where(Connector.user_id == user_id)).all()
        result: List[ConnectorEntry] = []
        for row in rows:
            result.append(
                ConnectorEntry(
                    id=row.id,
                    type=row.type,
                    enabled=row.enabled,
                    lastSyncedAt=row.last_synced_at.isoformat() if row.last_synced_at else None,
                )
            )
        return result


def add_connector(user_id: str, payload: ConnectorCreateRequest) -> ConnectorEntry:
    if payload.type not in SUPPORTED_TYPES:
        raise ValueError("Unsupported connector type")
    with get_session() as session:
        instance = Connector(
            id=payload.id,
            user_id=user_id,
            type=payload.type,
            enabled=True,
            access_token=TokenVault.encrypt(payload.accessToken),
            refresh_token=TokenVault.encrypt(payload.refreshToken),
            last_synced_at=datetime.utcnow(),
        )
        session.add(instance)
        session.flush()
        return ConnectorEntry(
            id=instance.id,
            type=instance.type,
            enabled=instance.enabled,
            lastSyncedAt=instance.last_synced_at.isoformat(),
        )


def set_connector_status(user_id: str, connector_id: str, enabled: bool) -> ConnectorEntry:
    with get_session() as session:
        instance = session.get(Connector, connector_id)
        if not instance or instance.user_id != user_id:
            raise ValueError("Connector not found")
        instance.enabled = enabled
        instance.last_synced_at = datetime.utcnow() if enabled else instance.last_synced_at
        session.add(instance)
        session.flush()
        return ConnectorEntry(
            id=instance.id,
            type=instance.type,
            enabled=instance.enabled,
            lastSyncedAt=instance.last_synced_at.isoformat() if instance.last_synced_at else None,
        )


def delete_connector(user_id: str, connector_id: str) -> None:
    with get_session() as session:
        instance = session.get(Connector, connector_id)
        if not instance or instance.user_id != user_id:
            raise ValueError("Connector not found")
        session.delete(instance)
