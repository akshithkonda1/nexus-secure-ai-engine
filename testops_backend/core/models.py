from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel


class RunState(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class RunStatus(BaseModel):
    run_id: str
    state: RunState
    summary: str
    created_at: datetime
    updated_at: datetime


class RunResult(BaseModel):
    run_id: str
    metrics: Dict[str, float]
    artifacts: Dict[str, str]
    deterministic: bool
    report_paths: List[str]


class StreamEvent(BaseModel):
    timestamp: str
    level: str
    message: str
    step: Optional[str] = None
