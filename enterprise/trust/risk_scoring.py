"""
Risk scoring combining hallucination likelihood, drift and anomalies.
"""
from __future__ import annotations

from typing import Dict


RISK_LABELS = [
    (0.25, "low"),
    (0.5, "moderate"),
    (0.75, "high"),
    (1.1, "critical"),
]


def compute_risk(inputs: Dict[str, float]) -> Dict[str, object]:
    weights = {
        "hallucination": 0.25,
        "drift": 0.2,
        "contradiction": 0.2,
        "behavior_anomaly": 0.2,
        "instability": 0.15,
    }
    score = sum(inputs.get(key, 0.0) * weight for key, weight in weights.items())
    for threshold, label in RISK_LABELS:
        if score <= threshold:
            return {"score": round(score, 3), "label": label}
    return {"score": round(score, 3), "label": "critical"}
