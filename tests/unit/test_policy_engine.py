from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import pytest


actions_by_tier: Dict[str, List[str]] = {
    "free": ["read"],
    "pro": ["read", "write"],
    "enterprise": ["read", "write", "admin"],
}


@dataclass
class RateLimitRule:
    tier: str
    rpm: int


class PolicyEngine:
    def __init__(self, rules: list[RateLimitRule]):
        self.rules = {rule.tier: rule for rule in rules}

    def validate_tier(self, tier: str) -> bool:
        if tier not in actions_by_tier:
            raise ValueError("unknown tier")
        return True

    def rate_limit_for(self, tier: str) -> int:
        self.validate_tier(tier)
        rule = self.rules.get(tier)
        if not rule:
            raise LookupError("rate limit not configured")
        return rule.rpm

    def enforce_permission(self, tier: str, action: str) -> bool:
        self.validate_tier(tier)
        if action not in actions_by_tier[tier]:
            raise PermissionError("not allowed")
        return True


def test_tier_validation_success():
    engine = PolicyEngine([RateLimitRule("free", 60)])
    assert engine.validate_tier("free")


def test_tier_validation_failure():
    engine = PolicyEngine([])
    with pytest.raises(ValueError):
        engine.validate_tier("unknown")


def test_rate_limit_mapping():
    rules = [RateLimitRule("pro", 300)]
    engine = PolicyEngine(rules)
    assert engine.rate_limit_for("pro") == 300


def test_permission_enforcement_allows_authorized_action():
    engine = PolicyEngine([RateLimitRule("enterprise", 1200)])
    assert engine.enforce_permission("enterprise", "admin")


def test_permission_enforcement_blocks_action():
    engine = PolicyEngine([RateLimitRule("free", 60)])
    with pytest.raises(PermissionError):
        engine.enforce_permission("free", "write")
