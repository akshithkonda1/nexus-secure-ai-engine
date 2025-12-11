"""Master runner orchestrating the full suite."""
from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from testops.backend.engine_adapter.adapter import EngineAdapter
from .k6_runner import run_k6_load
from .pipeline_checker import run_pipeline_checks
from .replay_engine import replay_snapshots
from .sim_batch import run_sim_batch
from .master_reporter import build_bundle, build_html_report, build_json_report
from .master_store import MasterStore
from .warroom_logger import log_error

BACKEND_ROOT = Path(__file__).resolve().parents[1]
LOG_DIR = BACKEND_ROOT / "logs" / "master"
LOG_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class RunState:
    run_id: str
    status: str = "pending"
    logs: List[str] = field(default_factory=list)
    results: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None


class MasterRunner:
    def __init__(self) -> None:
        self.store = MasterStore()
        self.adapter = EngineAdapter()
        self.run_states: Dict[str, RunState] = {}
        self.log_queues: Dict[str, asyncio.Queue[str]] = {}

    def _log(self, run_id: str, message: str) -> None:
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
        line = f"[{timestamp}] {message}"
        self.run_states.setdefault(run_id, RunState(run_id=run_id)).logs.append(line)
        self.log_queues.setdefault(run_id, asyncio.Queue()).put_nowait(line)
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        with (LOG_DIR / f"{run_id}.log").open("a", encoding="utf-8") as handle:
            handle.write(f"{line}\n")

    async def start_run(self, trigger: str = "full_suite") -> str:
        run_id = str(uuid4())
        state = RunState(run_id=run_id, status="running")
        self.run_states[run_id] = state
        self.log_queues[run_id] = asyncio.Queue()
        self.store.record_run(run_id, status="running")
        self._log(run_id, f"Run started via {trigger}")
        asyncio.create_task(self._execute(run_id))
        return run_id

    async def _execute(self, run_id: str) -> None:
        try:
            self._log(run_id, "Warmup Toron engine")
            warmup_result = await self.adapter.warmup()
            self.run_states[run_id].results["warmup"] = warmup_result

            self._log(run_id, "Running SIM batch")
            sim_result = await run_sim_batch(run_id, self.adapter)
            self.run_states[run_id].results["sim_batch"] = sim_result

            self._log(run_id, "Running pipeline checks")
            pipeline_result = await run_pipeline_checks(self.adapter)
            self.run_states[run_id].results["pipeline_checker"] = pipeline_result

            self._log(run_id, "Replaying snapshots")
            replay_result = await replay_snapshots(run_id, self.adapter)
            self.run_states[run_id].results["replay_engine"] = replay_result

            self._log(run_id, "Executing k6 load test")
            k6_result = run_k6_load(run_id)
            self.run_states[run_id].results["k6_runner"] = k6_result

            self.run_states[run_id].status = "completed"
            self.store.update_status(run_id, "completed")

            report_payload = self.run_states[run_id].results
            json_report = build_json_report(run_id, report_payload)
            html_report = build_html_report(run_id, report_payload)
            bundle = build_bundle(run_id, [json_report, html_report, LOG_DIR / f"{run_id}.log"])
            self.run_states[run_id].results["reports"] = {
                "json": str(json_report),
                "html": str(html_report),
                "bundle": str(bundle),
            }
            self.store.update_status(run_id, "completed", result_path=str(json_report))
            self.store.save_result(run_id, report_payload)
            self._log(run_id, "Run completed successfully")
        except Exception as exc:  # pragma: no cover - defensive guard
            error_message = str(exc)
            self.run_states[run_id].status = "failed"
            self.run_states[run_id].error = error_message
            self.store.update_status(run_id, "failed", error=error_message)
            self._log(run_id, f"Run failed: {error_message}")
            log_error(run_id, [error_message])

    def get_status(self, run_id: str) -> Optional[Dict[str, Any]]:
        state = self.run_states.get(run_id)
        if state:
            return {
                "run_id": run_id,
                "status": state.status,
                "error": state.error,
                "logs": list(state.logs),
            }
        return self.store.fetch_run(run_id)

    async def stream(self, run_id: str):
        queue = self.log_queues.get(run_id)
        if queue is None:
            return
        while True:
            try:
                message = await asyncio.wait_for(queue.get(), timeout=1.0)
                yield {"event": "message", "data": message}
            except asyncio.TimeoutError:
                status = self.run_states.get(run_id)
                if status and status.status in {"completed", "failed"} and queue.empty():
                    break
                continue

    def get_results(self, run_id: str) -> Optional[Dict[str, Any]]:
        state = self.run_states.get(run_id)
        if state and state.results:
            return state.results
        return self.store.fetch_result(run_id)

    def get_report_paths(self, run_id: str) -> Dict[str, Optional[str]]:
        state = self.run_states.get(run_id)
        reports = state.results.get("reports") if state else None
        return reports or {}


master_runner = MasterRunner()

__all__ = ["master_runner", "MasterRunner", "RunState", "LOG_DIR", "REPORTS_DIR"]
