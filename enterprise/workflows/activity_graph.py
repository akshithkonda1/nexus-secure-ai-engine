"""
Activity graph describing interactions between users, models and shared memory objects.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Dict, List, Tuple


class ActivityGraph:
    def __init__(self):
        self.edges: Dict[str, List[Tuple[str, str]]] = defaultdict(list)
        self.risk_tags: Dict[str, List[str]] = defaultdict(list)

    def add_usage(self, user: str, model: str, memory: str | None, risk: str | None = None) -> None:
        self.edges[user].append((model, memory or ""))
        if risk:
            self.risk_tags[user].append(risk)

    def graph(self) -> Dict[str, List[Tuple[str, str]]]:
        return dict(self.edges)

    def risk_summary(self) -> Dict[str, List[str]]:
        return dict(self.risk_tags)
