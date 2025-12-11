"""Run state model definitions for TestOps backend."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class RunState(BaseModel):
    """Represents persisted run state information."""

    run_id: str = Field(..., description="Unique identifier for the run")
    status: str = Field(..., description="Overall status of the run")
    phase: str = Field(..., description="Current phase of execution")
    progress: int = Field(..., ge=0, le=100, description="Progress percentage")
    started_at: datetime = Field(..., description="Run start time in UTC")
    updated_at: datetime = Field(..., description="Last update time in UTC")

    model_config = {
        "populate_by_name": True,
        "frozen": False,
    }


__all__ = ["RunState"]
