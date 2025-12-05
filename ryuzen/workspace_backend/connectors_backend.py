"""Registry for external connectors."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class Connector:
    id: str
    type: str
    configuration: Dict[str, str]
    active: bool = True


class ConnectorsBackend:
    """Stores connector configurations without calling external services."""

    def __init__(self) -> None:
        self._connectors: Dict[str, Connector] = {}

    def register(self, connector_id: str, connector_type: str, configuration: Dict[str, str]) -> Connector:
        if connector_id in self._connectors:
            raise ValueError(f"Connector '{connector_id}' already registered")
        connector = Connector(id=connector_id, type=connector_type, configuration=dict(configuration))
        self._connectors[connector_id] = connector
        return connector

    def update(self, connector_id: str, configuration: Dict[str, str] | None = None, active: Optional[bool] = None) -> Optional[Connector]:
        connector = self._connectors.get(connector_id)
        if not connector:
            return None
        if configuration is not None:
            connector.configuration.update(configuration)
        if active is not None:
            connector.active = active
        return connector

    def remove(self, connector_id: str) -> bool:
        return self._connectors.pop(connector_id, None) is not None

    def get(self, connector_id: str) -> Optional[Connector]:
        return self._connectors.get(connector_id)

    def list_all(self) -> List[Connector]:
        return list(self._connectors.values())
