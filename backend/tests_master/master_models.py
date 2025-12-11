from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


class RunStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    PASS = "PASS"
    FAIL = "FAIL"


@dataclass
class PhaseResult:
    name: str
    status: str
    metrics: Dict[str, Any] = field(default_factory=dict)
    logs: List[str] = field(default_factory=list)


@dataclass
class TestRun:
    run_id: str
    started_at: datetime
    finished_at: Optional[datetime] = None
    status: RunStatus = RunStatus.PENDING
    results: Dict[str, PhaseResult] = field(default_factory=dict)
    snapshot_path: Optional[str] = None
    report_path: Optional[str] = None

    def to_record(self) -> Dict[str, Any]:
        return {
            "run_id": self.run_id,
            "started_at": self.started_at.isoformat(),
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "status": self.status.value,
            "result_json": {
                phase: {
                    "status": res.status,
                    "metrics": res.metrics,
                    "logs": res.logs,
                }
                for phase, res in self.results.items()
            },
            "report_path": self.report_path,
            "snapshot_path": self.snapshot_path,
        }


@dataclass
class StreamEvent:
    timestamp: str
    module: str
    progress: float
    status: str
    message: str

    def serialize(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "module": self.module,
            "progress": self.progress,
            "status": self.status,
            "message": self.message,
        }
