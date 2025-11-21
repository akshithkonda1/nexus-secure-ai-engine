"""Composable Toron engine bootstrapper."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Any

from toron.cloud_adapter import CloudProviderAdapter
from toron.config import EngineConfig
from toron.connectors import ConnectorRegistry
from toron.pii import PIIPipeline
from toron.rate_limit import TokenBucket
from toron.retriever import Retriever


@dataclass
class ToronEngine:
    """Wire together the Toron primitives for testing and demos."""

    config: EngineConfig
    connectors: ConnectorRegistry
    adapter: CloudProviderAdapter
    pii_pipeline: PIIPipeline
    retriever: Retriever
    rate_limiter: TokenBucket
    metadata: Dict[str, Any] = field(default_factory=dict)

    def bootstrap(self) -> Dict[str, Any]:
        """Return a summarized bootstrap manifest for observability."""

        endpoints = {name: self.adapter.resolve(conn.source) for name, conn in self.connectors._connectors.items()}
        return {
            "host": self.config.host,
            "port": self.config.port,
            "connectors": self.connectors.list_metadata(),
            "endpoints": endpoints,
            "pii_token": self.pii_pipeline.redaction_token,
            "rate_limit_capacity": self.rate_limiter.capacity,
            "metadata": self.metadata or {"version": "1.6"},
        }
