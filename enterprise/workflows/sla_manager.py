"""
SLA manager for definition, enforcement and breach detection.
"""
from __future__ import annotations

import time
from typing import Dict, List


class SLAManager:
    def __init__(self):
        self.policies: Dict[str, Dict] = {}
        self.breaches: List[Dict] = []

    def define_sla(self, tenant_id: str, policy: Dict) -> None:
        self.policies[tenant_id] = policy

    def record_incident(self, tenant_id: str, detail: str) -> Dict:
        incident = {"tenant": tenant_id, "detail": detail, "timestamp": time.time()}
        self.breaches.append(incident)
        return incident

    def check_enforcement(self, tenant_id: str, latency_ms: float, availability: float) -> Dict[str, bool]:
        policy = self.policies.get(tenant_id, {"latency_ms": 500, "availability": 0.95})
        breach = latency_ms > policy.get("latency_ms", 500) or availability < policy.get("availability", 0.95)
        if breach:
            self.record_incident(tenant_id, f"latency={latency_ms}, availability={availability}")
        return {"breach": breach, "policy": policy}

    def compensation(self, tenant_id: str) -> float:
        incidents = [b for b in self.breaches if b["tenant"] == tenant_id]
        return len(incidents) * 0.05

    def export(self) -> List[Dict]:
        return self.breaches
