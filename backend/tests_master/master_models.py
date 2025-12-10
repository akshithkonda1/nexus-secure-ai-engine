from dataclasses import dataclass, field
from typing import Dict, List


@dataclass
class RunStatus:
    run_id: str
    timestamp: float
    status: str  # "started", "running", "completed", "error"
    progress: float = 0.0


@dataclass
class RunResult:
    run_id: str
    result: Dict[str, Any]
    created_at: datetime


@dataclass
class RunResult:
    run_id: str
    summary: Dict[str, Any]
    created_at: datetime
