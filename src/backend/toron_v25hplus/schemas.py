"""Pydantic schemas for the Toron v2.5H+ testing control plane."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SimRunRequest(BaseModel):
    scenario: str = "baseline"
    workload: int = Field(default=10, ge=1, description="Concurrent jobs to simulate")


class SimBatchRequest(BaseModel):
    scenarios: List[str]


class SimStressRequest(BaseModel):
    duration_seconds: int = Field(default=60, ge=10)
    concurrency: int = Field(default=50, ge=1)


class SimReplayRequest(BaseModel):
    seed_run_id: Optional[str] = None
    snapshot_id: Optional[str] = None


class LoadRunRequest(BaseModel):
    profile: str = "baseline"
    duration_seconds: int = Field(default=120, ge=30)
    virtual_users: int = Field(default=25, ge=1)


class LoadCustomRequest(BaseModel):
    profile_name: str
    rps_target: int = Field(default=500, ge=1)
    duration_seconds: int = Field(default=300, ge=30)


class TelemetryScrubRequest(BaseModel):
    note: str = "Scheduled scrub"


class TelemetryQuarantineRequest(BaseModel):
    reason: str
    signals: List[str] = Field(default_factory=list)


class EngineTierRequest(BaseModel):
    tier: str = Field(default="tier-1")


class EngineMalRequest(BaseModel):
    payload: Dict[str, Any]


class EngineDeterminismRequest(BaseModel):
    runs: int = Field(default=3, ge=1, le=25)


class EngineSnapshotValidateRequest(BaseModel):
    snapshot_id: str


class SnapshotDiffRequest(BaseModel):
    source_id: str
    target_id: str


class SnapshotRecord(BaseModel):
    snapshot_id: str
    run_id: str
    summary: str
    created_at: str
    payload: Dict[str, Any]


class MetricsEnvelope(BaseModel):
    label: str
    value: Any
    unit: Optional[str] = None
    trend: Optional[float] = None


class WarRoomEvent(BaseModel):
    severity: str
    message: str
    action: str
    created_at: str
