"""Enterprise safety orchestrator for Toron Phase 9."""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import List, Optional

from src.backend.audit.EncryptedAuditTrail import AuditEvent, EncryptedAuditTrail
from src.backend.enterprise.TenantIsolation import EnterpriseTenantIsolation, TenantPolicy
from src.backend.routing.MultiCloudFailoverRouter import MultiCloudFailoverRouter, RouteDecision
from src.backend.safety.AbuseIntentClassifier import AbuseIntentClassifier, AbuseClassification
from src.backend.safety.HallucinationDriftMonitor import DriftSignal, HallucinationDriftMonitor
from src.backend.safety.OutputRiskScorer import OutputRiskScorer, RiskScore
from src.backend.safety.PromptPoisoningDetector import PoisoningResult, PromptPoisoningDetector
from src.backend.utils.Logging import SafeLogger


@dataclass
class SafetyOutcome:
    sanitized_prompt: str
    poisoning: PoisoningResult
    abuse: AbuseClassification
    risk: RiskScore
    drift: DriftSignal
    routing: RouteDecision
    tenant_policy: TenantPolicy
    safe_mode: bool
    reasoning_budget: str


class SafetyOrchestrator:
    """Runs the safety pipeline and coordinates routing + auditing."""

    def __init__(
        self,
        poisoning_detector: Optional[PromptPoisoningDetector] = None,
        abuse_classifier: Optional[AbuseIntentClassifier] = None,
        risk_scorer: Optional[OutputRiskScorer] = None,
        drift_monitor: Optional[HallucinationDriftMonitor] = None,
        router: Optional[MultiCloudFailoverRouter] = None,
        audit_trail: Optional[EncryptedAuditTrail] = None,
        tenant_isolation: Optional[EnterpriseTenantIsolation] = None,
    ) -> None:
        self.poisoning_detector = poisoning_detector or PromptPoisoningDetector()
        self.abuse_classifier = abuse_classifier or AbuseIntentClassifier()
        self.risk_scorer = risk_scorer or OutputRiskScorer()
        self.drift_monitor = drift_monitor or HallucinationDriftMonitor()
        self.router = router or MultiCloudFailoverRouter()
        self.audit_trail = audit_trail or EncryptedAuditTrail()
        self.tenant_isolation = tenant_isolation or EnterpriseTenantIsolation()
        self.logger = SafeLogger("ryuzen-safety-orchestrator")

    def run(
        self,
        prompt: str,
        tenant_id: str,
        context_anchors: Optional[List[str]] = None,
        preferred_providers: Optional[List[str]] = None,
        expected_latency_ms: float = 0.0,
    ) -> SafetyOutcome:
        """Execute the Phase 9 safety pipeline and return the decision."""

        sanitized_prompt = prompt.replace("\n", " ").strip()
        policy = self.tenant_isolation.get_policy(tenant_id)
        poisoning = self.poisoning_detector.evaluate(sanitized_prompt, {"tenant_id": tenant_id})
        abuse = self.abuse_classifier.classify(sanitized_prompt, {"tenant_id": tenant_id})
        risk = self.risk_scorer.score_inputs(sanitized_prompt, poisoning.score, abuse.severity, {"tenant_id": tenant_id})

        # hallucination drift uses anchors + prompt as placeholder for generated context
        drift = self.drift_monitor.evaluate(context_anchors or [], sanitized_prompt, {"tenant_id": tenant_id})
        adjusted_risk = self.tenant_isolation.enforce_risk(tenant_id, risk.value)
        safe_mode = adjusted_risk >= 0.35 or drift.flagged or poisoning.suspicious

        routing = self.router.route(
            preferred=preferred_providers,
            risk_score=adjusted_risk,
            drift_score=drift.drift_score,
            tenant_allow_list=policy.routing_allow_list or None,
            safety_violation=safe_mode,
        )

        self._audit(
            tenant_id=tenant_id,
            model=routing.provider,
            latency_ms=expected_latency_ms,
            risk_score=adjusted_risk,
            drift_score=drift.drift_score,
            route_taken=[routing.provider, *routing.failover_chain],
        )

        reasoning_budget = "tight" if safe_mode else "standard"
        outcome = SafetyOutcome(
            sanitized_prompt=sanitized_prompt,
            poisoning=poisoning,
            abuse=abuse,
            risk=RiskScore(adjusted_risk, risk.risk_band, risk.safety_shaping),
            drift=drift,
            routing=routing,
            tenant_policy=policy,
            safe_mode=safe_mode,
            reasoning_budget=reasoning_budget,
        )
        self.logger.info(
            "safety-outcome",
            tenant_id=tenant_id,
            risk=adjusted_risk,
            drift=drift.drift_score,
            provider=routing.provider,
            safe_mode=safe_mode,
        )
        return outcome

    def _audit(
        self,
        tenant_id: str,
        model: str,
        latency_ms: float,
        risk_score: float,
        drift_score: float,
        route_taken: List[str],
    ) -> None:
        event = AuditEvent(
            timestamp=time.time(),
            model=model,
            latency_ms=latency_ms,
            risk_score=risk_score,
            drift_score=drift_score,
            tenant_id=tenant_id,
            route_taken=route_taken,
        )
        self.audit_trail.record(event)


__all__ = ["SafetyOrchestrator", "SafetyOutcome"]
