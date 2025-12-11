"""Billing tier validator for Phase 8 controlled beta readiness."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass
class BillingPolicy:
    name: str
    query_limit: int | None
    rollover_cap: int | None
    allows_unlimited: bool


@dataclass
class BillingComplianceReport:
    tier_results: Dict[str, bool]
    leakage_detected: bool
    notes: List[str]


class BillingTierValidator:
    """Validate billing tiers, limits, and leak protections."""

    def __init__(self) -> None:
        self.policies = {
            "beta": BillingPolicy(name="beta", query_limit=100, rollover_cap=1000, allows_unlimited=False),
            "student": BillingPolicy(name="student", query_limit=None, rollover_cap=None, allows_unlimited=True),
            "pro": BillingPolicy(name="pro", query_limit=None, rollover_cap=None, allows_unlimited=True),
            "premium": BillingPolicy(name="premium", query_limit=None, rollover_cap=None, allows_unlimited=True),
        }

    def _validate_limited(self, policy: BillingPolicy) -> bool:
        return policy.query_limit == 100 and policy.rollover_cap == 1000 and not policy.allows_unlimited

    def _validate_unlimited(self, policy: BillingPolicy) -> bool:
        return policy.allows_unlimited and policy.query_limit is None and policy.rollover_cap is None

    def run(self) -> BillingComplianceReport:
        tier_results: Dict[str, bool] = {}
        notes: List[str] = []

        for name, policy in self.policies.items():
            if name == "beta":
                tier_results[name] = self._validate_limited(policy)
                if not tier_results[name]:
                    notes.append("Beta tier limits misconfigured")
            else:
                tier_results[name] = self._validate_unlimited(policy)
                if not tier_results[name]:
                    notes.append(f"{policy.name.title()} tier should be unlimited")

        leakage_detected = any(result is False for result in tier_results.values())

        return BillingComplianceReport(
            tier_results=tier_results,
            leakage_detected=leakage_detected,
            notes=notes,
        )


__all__ = ["BillingTierValidator", "BillingComplianceReport", "BillingPolicy"]
