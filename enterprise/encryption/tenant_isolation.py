"""
Tenant isolation policies across storage, encryption, rate limits, memory and lineage.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Literal

IsolationBoundary = Literal["storage", "encryption", "rate_limits", "memory", "lineage"]


@dataclass
class TenantIsolationPolicy:
    tenant_id: str
    boundaries: Dict[IsolationBoundary, str]
    dedicated_region: bool = False

    def enforce(self, boundary: IsolationBoundary, resource_id: str) -> str:
        if self.boundaries.get(boundary) == "strict":
            return f"{self.tenant_id}:{resource_id}"
        return resource_id

    def assert_region(self, region: str) -> None:
        if self.dedicated_region and region != self.boundaries.get("storage", region):
            raise RuntimeError("Tenant pinned to dedicated region")

    def isolation_tags(self) -> Dict[str, str]:
        tags = {f"iso_{b}": lvl for b, lvl in self.boundaries.items()}
        tags["dedicated_region"] = str(self.dedicated_region)
        return tags
