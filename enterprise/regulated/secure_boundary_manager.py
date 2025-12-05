from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Dict, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class BoundaryDecision(BaseModel):
    tenant_id: str
    boundary_token: str
    context_hash: str
    allowed: bool
    reason: Optional[str] = None


@dataclass
class SecureBoundaryManager:
    """Tenant boundary enforcement with contextual isolation."""

    boundary_tokens: Dict[str, str] = field(default_factory=dict)

    def register_boundary(self, tenant_id: str, token: str) -> None:
        self.boundary_tokens[tenant_id] = token
        logger.debug("Boundary token registered for tenant %s", tenant_id)

    def verify(self, tenant_id: str, provided_token: str, context_hash: str) -> BoundaryDecision:
        expected = self.boundary_tokens.get(tenant_id)
        allowed = expected is not None and expected == provided_token
        reason = None if allowed else "Invalid or missing boundary token"
        decision = BoundaryDecision(
            tenant_id=tenant_id,
            boundary_token=provided_token,
            context_hash=context_hash,
            allowed=allowed,
            reason=reason,
        )
        logger.info("Boundary verification for %s: %s", tenant_id, decision.allowed)
        return decision

    def isolate_context(self, tenant_id: str, context: Dict[str, object]) -> Dict[str, object]:
        context_hash = str(hash(frozenset(context.items())))
        token = self.boundary_tokens.get(tenant_id, "")
        decision = self.verify(tenant_id, token, context_hash)
        if not decision.allowed:
            raise PermissionError(f"Tenant boundary violation for {tenant_id}: {decision.reason}")
        namespaced = {f"{tenant_id}:{key}": value for key, value in context.items()}
        logger.debug("Context isolated for tenant %s", tenant_id)
        return namespaced
