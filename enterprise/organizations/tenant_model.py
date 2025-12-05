"""
Tenant model capturing groups, sub-tenants and residency controls.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class ResidencySettings(BaseModel):
    region: str
    residency_required: bool = False


class Tenant(BaseModel):
    id: str
    name: str
    groups: List[str] = Field(default_factory=list)
    sub_tenants: List[str] = Field(default_factory=list)
    delegated_owner: Optional[str] = None
    cross_tenant_rules: List[str] = Field(default_factory=list)
    residency: ResidencySettings = Field(default_factory=lambda: ResidencySettings(region="global"))
