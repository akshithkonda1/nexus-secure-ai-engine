"""Shared dataclasses for TestOps runs."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List


@dataclass
class ModuleResult:
    name: str
    status: str
    metrics: Dict[str, Any] = field(default_factory=dict)
    notes: List[str] = field(default_factory=list)

    def summary(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "status": self.status,
            "metrics": self.metrics,
            "notes": self.notes,
        }


@dataclass
class RunSummary:
    run_id: str
    started_at: str
    status: str
    finished_at: str | None = None
    modules: List[ModuleResult] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "run_id": self.run_id,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "status": self.status,
            "modules": [m.summary() for m in self.modules],
        }


def utc_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


__all__ = ["ModuleResult", "RunSummary", "utc_now"]
