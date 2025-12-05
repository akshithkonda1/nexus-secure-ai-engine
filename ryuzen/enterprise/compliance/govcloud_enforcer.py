"""GovCloud request enforcement placeholder."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class EnforcementDecision:
    allowed: bool
    reason: str


class GovCloudEnforcer:
    """Validates request metadata for GovCloud style policies."""

    def __init__(self, allowed_regions: Optional[set[str]] = None, required_tags: Optional[Dict[str, str]] = None) -> None:
        self.allowed_regions = allowed_regions or {"us-gov-west-1", "us-gov-east-1"}
        self.required_tags = required_tags or {}

    def enforce_request(self, metadata: Dict[str, str]) -> EnforcementDecision:
        region = metadata.get("region")
        if region not in self.allowed_regions:
            return EnforcementDecision(False, "Region not permitted")

        for key, value in self.required_tags.items():
            if metadata.get(key) != value:
                return EnforcementDecision(False, f"Missing required tag {key}")

        return EnforcementDecision(True, "Request meets GovCloud constraints")
