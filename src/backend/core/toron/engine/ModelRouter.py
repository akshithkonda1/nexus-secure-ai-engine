from __future__ import annotations

from typing import Iterable, List, Optional, Tuple

from nexus.plan_resolver import UserTierContext, get_effective_tier

from .CloudProviderAdapter import CloudProviderAdapter


class ModelRouter:
    """Select models per request using existing tier selection logic."""

    def __init__(self, adapter: CloudProviderAdapter):
        self.adapter = adapter

    def route(
        self,
        requested_models: Optional[Iterable[str]],
        user: Optional[UserTierContext],
        default_tier: str = "pro",
    ) -> Tuple[List[str], bool, Optional[str]]:
        tier_user = user or UserTierContext(id="anonymous", billing_tier=default_tier)
        tier_name = get_effective_tier(tier_user)
        return self.adapter.resolve_models(requested_models, tier_name)


__all__ = ["ModelRouter"]
