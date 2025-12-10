"""Pydantic models and enums for the master test runner."""
from __future__ import annotations

import datetime as dt
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class RunStatus(str, Enum):
    """Enumeration of possible run states."""

    STARTED = "started"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class TestProgress(BaseModel):
    """Represents progress for a single test run."""

    run_id: str
    status: RunStatus
    percent: float = Field(ge=0, le=100)
    message: str = ""
    details: Dict[str, Any] = Field(default_factory=dict)


class RunSummary(BaseModel):
    """Aggregate summary for a master run."""

    run_id: str
    status: RunStatus
    started_at: dt.datetime
    finished_at: Optional[dt.datetime]
    metrics: Dict[str, Any] = Field(default_factory=dict)
    errors: List[str] = Field(default_factory=list)

    class Config:
        json_encoders = {dt.datetime: lambda v: v.isoformat()}


class SnapshotReplayResult(BaseModel):
    """Result of the determinism replay test."""

    determinism_score: float
    mismatched_bytes: int
    total_bytes: int
    identical: bool
    snapshot_path: str


class LoadTestResult(BaseModel):
    """Summary of the load test run."""

    p95_latency_ms: float
    failure_rate: float
    throughput_rps: float
    duration_seconds: int
    virtual_users: int
    target_rps: int
    result_path: str


class PipelineDiagnostics(BaseModel):
    """Tier-by-tier diagnostics and pipeline distribution."""

    pipeline_path_distribution: Dict[str, float]
    tier_stability: Dict[str, float]
    confidence_distribution: Dict[str, float]
    escalation_rate: float
    contradiction_frequency: float

