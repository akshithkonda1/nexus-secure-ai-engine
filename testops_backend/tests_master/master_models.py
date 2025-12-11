from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional


class TestPhase(str, Enum):
    engine_validation = "Engine Validation"
    sim_batch = "SIM Batch"
    pipeline = "Pipeline Check"
    load_test = "Load Test"
    replay = "Determinism Replay"
    reporting = "Reporting"


@dataclass
class PhaseResult:
    phase: TestPhase
    success: bool
    details: Dict[str, float] = field(default_factory=dict)
    notes: List[str] = field(default_factory=list)


@dataclass
class MasterResult:
    run_id: str
    started_at: datetime
    completed_at: Optional[datetime]
    phases: List[PhaseResult]
    deterministic: bool
    artifacts: Dict[str, str]


@dataclass
class LogEvent:
    timestamp: str
    level: str
    message: str
    step: Optional[str] = None
