"""Master runner orchestrating the full suite per specification."""
from __future__ import annotations

import asyncio
import importlib
import json
import pkgutil
import random
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from sse_starlette.sse import EventSourceResponse

from .engine_validator import validate_engine
from .master_models import ModuleResult, RunSummary, utc_now
from .master_reporter import build_html_report, build_json_report, build_snapshot, build_warroom_log
from .master_sse import sse_manager
from .master_store import MasterStore
from .sim.sim_runner import run_all as run_sim_suite
from .sim.sim_replay import run_replay_validation

BACKEND_ROOT = Path(__file__).resolve().parents[1]
LOG_DIR = BACKEND_ROOT / "logs" / "master"
REPORT_DIR = BACKEND_ROOT / "reports" / "master"
SNAPSHOT_DIR = BACKEND_ROOT / "snapshots"
WARROOM_DIR = BACKEND_ROOT / "warroom" / "master"


@dataclass
class RunState:
    run_id: str
    status: str = "PENDING"
    progress: float = 0.0
    logs: List[str] = field(default_factory=list)
    results: Dict[str, Any] = field(default_factory=dict)
    summary: RunSummary | None = None
    errors: List[str] = field(default_factory=list)
    queue: asyncio.Queue[str] | None = None


class MasterRunner:
    def __init__(self) -> None:
        self.store = MasterStore()
        self.run_states: Dict[str, RunState] = {}

    def _log(self, run_id: str, message: str) -> None:
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        line = f"[{timestamp}] {message}"
        state = self.run_states.setdefault(run_id, RunState(run_id=run_id))
        state.logs.append(line)
        sse_manager.push(run_id, line)
        self.store.log(run_id, message, timestamp)
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        with (LOG_DIR / f"{run_id}.log").open("a", encoding="utf-8") as handle:
            handle.write(line + "\n")

    def _discover_modules(self, package: str) -> List[str]:
        pkg = importlib.import_module(package)
        return [name for _, name, is_pkg in pkgutil.iter_modules(pkg.__path__) if not is_pkg and not name.startswith("_")]

    async def start_run(self, trigger: str = "api") -> str:
        run_id = str(uuid4())
        self.run_states[run_id] = RunState(run_id=run_id, status="RUNNING", queue=sse_manager.create_stream(run_id))
        self.store.record_run(run_id, status="RUNNING")
        self._log(run_id, f"Run started via {trigger}")
        asyncio.create_task(self._execute(run_id))
        return run_id

    def _module_result(self, name: str, status: str, metrics: Dict[str, Any], notes: List[str]) -> ModuleResult:
        return ModuleResult(name=name, status=status, metrics=metrics, notes=notes)

    def _run_dynamic_package(self, run_id: str, package: str) -> List[ModuleResult]:
        results: List[ModuleResult] = []
        for module_name in self._discover_modules(f"testops.backend.tests_master.{package}"):
            fqmn = f"testops.backend.tests_master.{package}.{module_name}"
            mod = importlib.import_module(fqmn)
            random.seed(f"{run_id}:{module_name}")
            runner = getattr(mod, "run_tests", None)
            if not runner:
                continue
            self._log(run_id, f"Executing {package}:{module_name}")
            outcome = runner(run_id)
            status = outcome.get("status", "PASS")
            metrics = outcome.get("metrics", {})
            notes = outcome.get("notes", [])
            results.append(self._module_result(module_name, status, metrics, notes))
        return results

    async def _execute(self, run_id: str) -> None:
        state = self.run_states[run_id]
        summary = RunSummary(run_id=run_id, started_at=utc_now(), status="RUNNING")
        try:
            validation = validate_engine()
            state.results["engine_validation"] = validation
            self._log(run_id, "Engine validation complete")

            self._log(run_id, "Running SIM suite")
            sim_result = run_sim_suite(run_id)
            summary.modules.append(self._module_result("sim_suite", sim_result["status"], sim_result["metrics"], sim_result.get("notes", [])))
            state.results["sim_suite"] = sim_result
            state.progress = 12.5

            phase_packages = [
                ("engine_hardening", "Engine Hardening"),
                ("cloud_hardening", "Cloud Hardening"),
                ("security_hardening", "Security Hardening"),
                ("load_and_chaos", "Load and Chaos"),
            ]

            for idx, (package, label) in enumerate(phase_packages, start=1):
                self._log(run_id, f"Running phase: {label}")
                results = self._run_dynamic_package(run_id, package)
                summary.modules.extend(results)
                state.results[package] = [m.summary() for m in results]
                state.progress = 12.5 + idx * 10

            self._log(run_id, "Running replay determinism checks")
            replay_result = run_replay_validation(run_id)
            summary.modules.append(self._module_result("replay", replay_result["status"], replay_result["metrics"], replay_result.get("notes", [])))
            state.results["replay"] = replay_result
            state.progress = 60

            beta_phase_packages = [
                ("beta_readiness", "Controlled Beta"),
                ("public_beta", "Public Beta"),
            ]
            for idx, (package, label) in enumerate(beta_phase_packages, start=1):
                self._log(run_id, f"Running phase: {label}")
                results = self._run_dynamic_package(run_id, package)
                summary.modules.extend(results)
                state.results[package] = [m.summary() for m in results]
                state.progress = 60 + idx * 15

            self._log(run_id, "Running v3 migration matrix")
            migration_results = self._run_dynamic_package(run_id, "v3_migration")
            summary.modules.extend(migration_results)
            state.results["v3_migration"] = [m.summary() for m in migration_results]
            state.progress = 95

            status = "PASS" if all(m.status == "PASS" for m in summary.modules) else "FAIL"
            summary.status = status
            summary.finished_at = utc_now()
            state.status = status
            state.summary = summary
            state.progress = 100
            state.results["summary"] = summary.to_dict()

            json_path = build_json_report(run_id, state.results)
            html_path = build_html_report(run_id, summary)
            snapshot_path = build_snapshot(run_id, state.results)
            warroom_path = build_warroom_log(run_id, state.logs)

            self.store.save_result(run_id, state.results)
            self.store.update_status(
                run_id,
                status=status,
                result_json=json.dumps(state.results),
                report_path=str(html_path),
                snapshot_path=str(snapshot_path),
                finished_at=summary.finished_at,
            )
            state.results["reports"] = {
                "html": str(html_path),
                "json": str(json_path),
                "snapshot": str(snapshot_path),
                "warroom": str(warroom_path),
            }
            self._log(run_id, f"Run completed with status {status}")
        except Exception as exc:  # pragma: no cover - defensive guard
            state.status = "FAIL"
            summary.status = "FAIL"
            summary.finished_at = utc_now()
            state.summary = summary
            state.errors.append(str(exc))
            self.store.update_status(run_id, status="FAIL", finished_at=summary.finished_at)
            self._log(run_id, f"Run failed: {exc}")
        finally:
            self.run_states[run_id] = state

    def get_status(self, run_id: str) -> Optional[Dict[str, Any]]:
        state = self.run_states.get(run_id)
        if state:
            return {
                "run_id": run_id,
                "status": state.status,
                "progress": state.progress,
                "logs": list(state.logs),
                "summary": state.summary.to_dict() if state.summary else None,
                "statuses": {m.name: m.status for m in (state.summary.modules if state.summary else [])},
            }
        return self.store.fetch_run(run_id)

    def get_results(self, run_id: str) -> Optional[Dict[str, Any]]:
        state = self.run_states.get(run_id)
        if state and state.results:
            return state.results
        return self.store.fetch_result(run_id)

    def get_report_paths(self, run_id: str) -> Dict[str, Optional[str]]:
        state = self.run_states.get(run_id)
        reports = state.results.get("reports") if state else None
        return reports or {}

    def stream(self, run_id: str):
        generator = sse_manager.stream(run_id)
        if generator is None:
            return None
        return EventSourceResponse(generator)


master_runner = MasterRunner()

__all__ = ["master_runner", "RunState"]
