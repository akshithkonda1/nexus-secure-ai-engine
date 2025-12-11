"""Feature gate validator for public beta tiers."""
from dataclasses import dataclass
from typing import Dict, List


@dataclass
class GateTestResult:
    """Result for a specific tier validation."""

    tier: str
    compliant: bool
    detail: str


@dataclass
class GateComplianceReport:
    """Summary of gate validations and overall compliance score."""

    tests: List[GateTestResult]
    gate_compliance_score: float

    def as_dict(self) -> Dict[str, object]:
        return {
            "tests": [result.__dict__ for result in self.tests],
            "gate_compliance_score": self.gate_compliance_score,
        }


class FeatureGateValidator:
    """Validates feature gates across public beta subscription tiers."""

    def __init__(self) -> None:
        self.tier_limits = {
            "free": {"limit": 30, "leak_protection": True},
            "pro": {"limit": None, "leak_protection": True},
            "student": {"limit": None, "leak_protection": True},
            "premium": {"limit": None, "leak_protection": True},
        }

    def _validate_tier(self, tier: str, usage: int) -> GateTestResult:
        rules = self.tier_limits[tier]
        limit = rules["limit"]
        leak_protection = rules["leak_protection"]
        if limit is None:
            compliant = leak_protection
            detail = "Unlimited access with leak protection enforced."
        else:
            compliant = usage <= limit and leak_protection
            detail = f"Usage {usage}/limit {limit} with leak protection {leak_protection}."
        return GateTestResult(tier=tier, compliant=compliant, detail=detail)

    def validate(self, simulated_usage: Dict[str, int]) -> GateComplianceReport:
        tests = [
            self._validate_tier("free", simulated_usage.get("free", 0)),
            self._validate_tier("pro", simulated_usage.get("pro", 0)),
            self._validate_tier("student", simulated_usage.get("student", 0)),
            self._validate_tier("premium", simulated_usage.get("premium", 0)),
        ]
        compliance_ratio = sum(1 for result in tests if result.compliant) / len(tests)
        gate_compliance_score = round(compliance_ratio * 100, 2)
        return GateComplianceReport(tests=tests, gate_compliance_score=gate_compliance_score)
