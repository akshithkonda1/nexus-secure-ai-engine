"""Connector registry and metadata utilities."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, List


@dataclass
class Connector:
    """Represent a data connector exposed by the engine."""

    name: str
    source: str
    version: str
    metadata: Dict[str, str] = field(default_factory=dict)


class ConnectorRegistry:
    """In-memory registry used for tests and bootstrap flows."""

    def __init__(self) -> None:
        self._connectors: Dict[str, Connector] = {}

    def register(self, connector: Connector) -> None:
        self._connectors[connector.name] = connector

    def get(self, name: str) -> Connector:
        if name not in self._connectors:
            raise KeyError(f"Connector {name} not found")
        return self._connectors[name]

    def list_metadata(self) -> List[Dict[str, str]]:
        return [conn.metadata | {"name": conn.name, "source": conn.source} for conn in self._connectors.values()]

    @classmethod
    def default(cls, sources: Iterable[str] | None = None) -> "ConnectorRegistry":
        registry = cls()
        for provider in sources or ("aws", "azure", "gcp"):
            registry.register(
                Connector(
                    name=f"{provider}-bedrock" if provider == "aws" else f"{provider}-llm",
                    source=provider,
                    version="1.6",
                    metadata={"region": "us-east-1", "status": "active", "provider": provider},
                )
            )
        return registry
