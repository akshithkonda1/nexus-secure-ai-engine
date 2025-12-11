"""Master runner orchestrating Section 2 of Ryuzen TestOps."""
from __future__ import annotations

import asyncio
import json
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4

from sse_starlette.sse import EventSourceResponse

from testops.backend.replay.replay_engine import ReplayEngine
from testops.backend.tests_master.k6_runner import run_k6_load
from testops.backend.tests_master.sim.sim_runner import run_all as run_sim_suite
from testops.backend.warroom.warroom_logger import WarroomLogger

BASE_DIR = Path(__file__).resolve().parents[2]
SNAPSHOT_DIR = BASE_DIR / "snapshots"
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)


class SSEBroker:
    """Minimal SSE manager for streaming run logs."""

    def __init__(self) -> None:
        self.queues: Dict[str, asyncio.Queue[str]] = {}

    def create(self, run_id: str) -> asyncio.Queue[str]:
        queue: asyncio.Queue[str] = asyncio.Queue()
        self.queues[run_id] = queue
        return queue

    def push(self, run_id: str, message: str) -> None:
        queue = self.queues.get(run_id)
        if queue is None:
            queue = self.create(run_id)
        queue.put_nowait(message)

    async def iterate(self, run_id: str):
        queue = self.queues.get(run_id)
        if queue is None:
            return
        while True:
            message = await queue.get()
            yield {"event": "log", "data": message}


@dataclass
class RunState:
    run_id: str
    status: str = "PENDING"
    progress: float = 0.0
    logs: list[str] = field(default_factory=list)
    results: Dict[str, Any] = field(default_factory=dict)
    started_at: Optional[str] = None
    finished_at: Optional[str] = None


class MasterRunner:
    """Lightweight orchestrator for sim, k6, and replay stages."""

    def __init__(self) -> None:
        self.states: Dict[str, RunState] = {}
        self.sse = SSEBroker()
        self.replay_engine = ReplayEngine()
        self.warroom = WarroomLogger()

    def _log(self, run_id: str, message: str) -> None:
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        line = f"[{timestamp}] {message}"
        state = self.states.setdefault(run_id, RunState(run_id=run_id))
        state.logs.append(line)
        self.sse.push(run_id, line)

    async def start_run(self, trigger: str = "api") -> str:
        run_id = str(uuid4())
        self.states[run_id] = RunState(run_id=run_id, status="RUNNING", progress=0.0, started_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
        self.sse.create(run_id)
        asyncio.create_task(self._execute(run_id, trigger))
        return run_id

    async def _execute(self, run_id: str, trigger: str) -> None:
        state = self.states[run_id]
        self._log(run_id, f"Run started via {trigger}")
        try:
            self._log(run_id, "Executing SIM runner")
            sim_result = run_sim_suite(run_id)
            state.progress = 25
            state.results["sim_runner"] = sim_result

            self._log(run_id, "Executing k6 runner")
            k6_result = run_k6_load(run_id)
            state.progress = 55
            state.results["k6_runner"] = k6_result

            snapshot = {
                "run_id": run_id,
                "trigger": trigger,
                "started_at": state.started_at,
                "sim": sim_result,
                "k6": k6_result,
            }
            snapshot_path = SNAPSHOT_DIR / f"{run_id}.json"
            snapshot_path.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
            state.results["snapshot_path"] = str(snapshot_path)
            self._log(run_id, f"Snapshot written to {snapshot_path}")

            self._log(run_id, "Executing replay determinism")
            replay_result = self.replay_engine.validate(snapshot)
            state.progress = 85
            state.results["replay_engine"] = replay_result

            aggregated = {
                "run_id": run_id,
                "trigger": trigger,
                "started_at": state.started_at,
                "finished_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "results": {
                    "sim_runner": sim_result,
                    "k6_runner": k6_result,
                },
                "replay": replay_result,
                "snapshot": str(snapshot_path),
            }
            state.finished_at = aggregated["finished_at"]
            state.results["aggregated"] = aggregated
            state.status = "PASS" if replay_result.get("determinism_score", 0) >= 90 else "WARN"
            state.progress = 100
            self._log(run_id, f"Run completed with status {state.status}")
        except Exception as exc:  # pragma: no cover
            state.status = "FAIL"
            state.finished_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            state.results["error"] = str(exc)
            self.warroom.log_error(
                subsystem="master_runner",
                severity="CRITICAL",
                message=str(exc),
                suggestion="Inspect snapshot and replay inputs for corrupt state.",
            )
            self._log(run_id, f"Run failed: {exc}")
        finally:
            self.states[run_id] = state

    def get_status(self, run_id: str) -> Optional[Dict[str, Any]]:
        state = self.states.get(run_id)
        if not state:
            return None
        return {
            "run_id": run_id,
            "status": state.status,
            "progress": state.progress,
            "logs": list(state.logs),
            "started_at": state.started_at,
            "finished_at": state.finished_at,
        }

    def get_results(self, run_id: str) -> Optional[Dict[str, Any]]:
        state = self.states.get(run_id)
        if not state or not state.results:
            return None
        return state.results

    def stream(self, run_id: str) -> Optional[EventSourceResponse]:
        if run_id not in self.states:
            return None
        return EventSourceResponse(self.sse.iterate(run_id))


def _build_runner() -> MasterRunner:
    return MasterRunner()


master_runner = _build_runner()

__all__ = ["master_runner", "MasterRunner", "RunState", "SSEBroker"]
