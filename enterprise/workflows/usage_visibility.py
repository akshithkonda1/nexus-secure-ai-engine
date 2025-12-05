"""
Usage visibility across user/team/org scopes with forecasting.
"""
from __future__ import annotations

import statistics
from typing import Dict, List


class UsageVisibility:
    def __init__(self):
        self.user_usage: Dict[str, List[float]] = {}
        self.team_usage: Dict[str, List[float]] = {}
        self.org_usage: Dict[str, List[float]] = {}
        self.model_breakdown: Dict[str, List[float]] = {}

    def track(self, scope: str, identifier: str, value: float, model: str) -> None:
        target = getattr(self, f"{scope}_usage")
        target.setdefault(identifier, []).append(value)
        self.model_breakdown.setdefault(model, []).append(value)

    def summarize(self) -> Dict[str, Dict[str, float]]:
        return {
            "user": {k: sum(v) for k, v in self.user_usage.items()},
            "team": {k: sum(v) for k, v in self.team_usage.items()},
            "org": {k: sum(v) for k, v in self.org_usage.items()},
            "model": {k: sum(v) for k, v in self.model_breakdown.items()},
        }

    def latency_cost_graphs(self) -> Dict[str, float]:
        return {model: statistics.mean(values) for model, values in self.model_breakdown.items() if values}

    def forecast(self, identifier: str, scope: str = "org") -> float:
        target = getattr(self, f"{scope}_usage")
        history = target.get(identifier, [])
        if len(history) < 2:
            return float(history[0]) if history else 0.0
        growth = statistics.mean(history[-5:])
        return sum(history) + growth
