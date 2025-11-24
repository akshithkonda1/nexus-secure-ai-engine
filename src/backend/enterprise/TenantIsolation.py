"""Enterprise tenant isolation and policy enforcement."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from src.backend.utils.Logging import SafeLogger


@dataclass
class TenantPolicy:
    tenant_id: str
    rate_limit_per_minute: int = 60
    routing_allow_list: List[str] = field(default_factory=list)
    model_allow_list: List[str] = field(default_factory=list)
    custom_risk_tolerance: float = 0.6
    connector_allow_list: List[str] = field(default_factory=list)
    connector_deny_list: List[str] = field(default_factory=list)
    compliance_filters: List[str] = field(default_factory=list)


class EnterpriseTenantIsolation:
    """In-memory tenant policy store with isolation checks."""

    def __init__(self) -> None:
        self.logger = SafeLogger("ryuzen-tenant")
        self._policies: Dict[str, TenantPolicy] = {}

    def register(self, policy: TenantPolicy) -> None:
        self._policies[policy.tenant_id] = policy
        self.logger.info("tenant-registered", tenant_id=policy.tenant_id)

    def get_policy(self, tenant_id: str) -> TenantPolicy:
        if tenant_id not in self._policies:
            default_policy = TenantPolicy(tenant_id=tenant_id)
            self._policies[tenant_id] = default_policy
        return self._policies[tenant_id]

    def evaluate_request(self, tenant_id: str, requested_connectors: Optional[List[str]] = None) -> TenantPolicy:
        policy = self.get_policy(tenant_id)
        if requested_connectors:
            blocked = set(requested_connectors).intersection(set(policy.connector_deny_list))
            if blocked:
                self.logger.warning("connector-blocked", tenant_id=tenant_id, blocked=list(blocked))
                raise PermissionError(f"Connector access blocked: {','.join(blocked)}")
        return policy

    def enforce_risk(self, tenant_id: str, risk_score: float) -> float:
        policy = self.get_policy(tenant_id)
        allowed_score = min(policy.custom_risk_tolerance, 0.95)
        adjusted_score = max(risk_score, allowed_score)
        self.logger.info(
            "risk-adjusted",
            tenant_id=tenant_id,
            requested=risk_score,
            allowed=allowed_score,
            effective=adjusted_score,
        )
        return adjusted_score

    def allowed_providers(self, tenant_id: str) -> List[str]:
        policy = self.get_policy(tenant_id)
        if policy.routing_allow_list:
            return policy.routing_allow_list
        return ["aws-bedrock", "openai", "google-vertex", "anthropic", "local"]


__all__ = ["EnterpriseTenantIsolation", "TenantPolicy"]
