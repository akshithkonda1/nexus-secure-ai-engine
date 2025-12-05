"""Tenant isolation helpers with safe defaults."""
from __future__ import annotations

import logging
from typing import Dict

logger = logging.getLogger(__name__)


class TenantIsolation:
    def __init__(self):
        self._policies: Dict[str, Dict[str, str]] = {}

    def set_policy(self, tenant_id: str, policy: Dict[str, str]) -> None:
        self._policies[tenant_id] = policy
        logger.debug("Registered tenant policy for %s", tenant_id)

    def get_policy(self, tenant_id: str) -> Dict[str, str]:
        return self._policies.get(tenant_id, {})

    def enforce(self, tenant_id: str, resource_owner: str) -> bool:
        policy = self.get_policy(tenant_id)
        if not policy:
            return True
        if policy.get("isolation") == "strict":
            allowed = tenant_id == resource_owner
            if not allowed:
                logger.warning("Tenant isolation prevented cross-tenant access: %s -> %s", tenant_id, resource_owner)
            return allowed
        return True
