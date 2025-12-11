"""Service for managing run status persistence."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from testops.backend.models.run_state import RunState
from testops.backend.store.run_state_store import store


class TestStatusService:
    """Encapsulates run status operations."""

    def start_run(self, run_id: str) -> RunState:
        now = datetime.now(timezone.utc)
        run_state = RunState(
            run_id=run_id,
            status="running",
            phase="initializing",
            progress=0,
            started_at=now,
            updated_at=now,
        )
        store.save(run_state)
        return run_state

    def update_phase(self, run_id: str, phase: str, progress: Optional[int] = None) -> Optional[RunState]:
        now = datetime.now(timezone.utc)
        fields = {"phase": phase, "updated_at": now}
        if progress is not None:
            bounded = max(0, min(100, progress))
            fields["progress"] = bounded
        return store.update_fields(run_id, **fields)

    def update_progress(self, run_id: str, progress: int) -> Optional[RunState]:
        return self.update_phase(run_id, phase=self.get_phase(run_id) or "running", progress=progress)

    def complete_run(self, run_id: str) -> Optional[RunState]:
        now = datetime.now(timezone.utc)
        return store.update_fields(
            run_id,
            status="completed",
            phase="completed",
            progress=100,
            updated_at=now,
        )

    def fail_run(self, run_id: str, phase: str) -> Optional[RunState]:
        now = datetime.now(timezone.utc)
        return store.update_fields(
            run_id,
            status="failed",
            phase=phase,
            updated_at=now,
        )

    def get_status(self, run_id: str) -> Optional[RunState]:
        return store.get(run_id)

    def get_phase(self, run_id: str) -> Optional[str]:
        run_state = store.get(run_id)
        return run_state.phase if run_state else None


test_status_service = TestStatusService()

__all__ = ["TestStatusService", "test_status_service"]
