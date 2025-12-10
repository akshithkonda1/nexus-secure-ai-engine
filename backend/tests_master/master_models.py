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
    started_at: float
    completed_at: float
    success: bool
    summary: Dict[str, object]
    report_path: str
    snapshot_paths: List[str]


@dataclass
class TestArtifact:
    name: str
    passed: bool
    details: Dict[str, object] = field(default_factory=dict)
