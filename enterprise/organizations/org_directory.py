"""
Org directory storing hierarchy, metadata and entitlements.
"""
from __future__ import annotations

from typing import Dict, List

from pydantic import BaseModel, Field


class OrgMetadata(BaseModel):
    plan: str
    suspended: bool = False
    entitlements: List[str] = Field(default_factory=list)


class OrgDirectory:
    def __init__(self):
        self.orgs: Dict[str, OrgMetadata] = {}
        self.graph: Dict[str, List[str]] = {}

    def add_org(self, org_id: str, plan: str, entitlements: List[str] | None = None) -> None:
        self.orgs[org_id] = OrgMetadata(plan=plan, entitlements=entitlements or [])

    def set_parent(self, org_id: str, parent_id: str) -> None:
        self.graph.setdefault(parent_id, []).append(org_id)

    def suspend(self, org_id: str) -> None:
        if org_id in self.orgs:
            self.orgs[org_id].suspended = True

    def unsuspend(self, org_id: str) -> None:
        if org_id in self.orgs:
            self.orgs[org_id].suspended = False

    def metadata(self, org_id: str) -> OrgMetadata:
        return self.orgs[org_id]

    def children(self, org_id: str) -> List[str]:
        return self.graph.get(org_id, [])
