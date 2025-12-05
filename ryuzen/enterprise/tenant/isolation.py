"""Tenant isolation enforcement primitives."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class IsolationDecision:
    allowed: bool
    reason: str


class TenantIsolation:
    """Keeps tenant specific rules in memory for deterministic enforcement."""

    def __init__(self) -> None:
        self._shared_resources: set[str] = set()
        self._owners: Dict[str, str] = {}

    def register_resource(self, resource_id: str, owner_tenant: str, shared: bool = False) -> None:
        self._owners[resource_id] = owner_tenant
        if shared:
            self._shared_resources.add(resource_id)
        elif resource_id in self._shared_resources:
            self._shared_resources.remove(resource_id)

    def enforce(self, tenant_id: str, resource_id: str) -> IsolationDecision:
        owner: Optional[str] = self._owners.get(resource_id)
        if owner is None:
            return IsolationDecision(allowed=False, reason="Unknown resource")
        if resource_id in self._shared_resources:
            return IsolationDecision(allowed=True, reason="Resource shared across tenants")
        if owner == tenant_id:
            return IsolationDecision(allowed=True, reason="Tenant owns resource")
        return IsolationDecision(allowed=False, reason="Cross-tenant access denied")
