from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List

from pydantic import BaseModel, Field


class TestRunStatus(BaseModel):
    run_id: str
    status: str
    progress: int
    current_stage: str


class RunStatus(str, Enum):
    started = "started"
    completed = "completed"
    failed = "failed"


class PipelineDiagnostics(BaseModel):
    pipeline_path_distribution: Dict[str, float]
    tier_stability: Dict[str, float]
    confidence_distribution: Dict[str, float]
    escalation_rate: float
    contradiction_frequency: float


class LoadTestResult(BaseModel):
    p95_latency_ms: float
    failure_rate: float
    throughput_rps: float
    duration_seconds: int
    virtual_users: int
    target_rps: int
    result_path: str


class SnapshotReplayResult(BaseModel):
    determinism_score: float
    mismatched_bytes: int
    total_bytes: int
    identical: bool
    snapshot_path: str


class RunSummary(BaseModel):
    run_id: str
    status: RunStatus
    metrics: Dict[str, Any]
    errors: List[str] = Field(default_factory=list)


@dataclass
class TestRunRecord:
    run_id: str
    status: str
    created_at: Any
    updated_at: Any


@dataclass
class TestResult:
    run_id: str
    result: Dict[str, Any]
    created_at: Any
