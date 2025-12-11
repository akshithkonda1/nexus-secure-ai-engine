"""Master runner orchestrating Ryuzen TestOps Wave 3."""
from __future__ import annotations

import asyncio
import json
import random
import time
from dataclasses import dataclass, field
from pathlib import Path
from random import Random
from typing import Any, Dict, Optional
from uuid import uuid4

from sse_starlette.sse import EventSourceResponse

from testops.backend.reporters.master_reporter import generate_html_report, generate_json_report
from testops.backend.runners.master_store import MasterStore, REPORT_ROOT
from testops.backend.runners.pipeline_checker import run_checks
from testops.backend.tests_master.k6_runner import run_k6_load
from testops.backend.tests_master.sim.sim_runner import run_all as run_sim_suite
from testops.backend.utils.bundle_creator import create_bundle
from testops.backend.replay.replay_engine import ReplayEngine
from testops.backend.warroom.warroom_logger import WarroomLogger

BASE_DIR = Path(__file__).resolve().parents[2]


class SSEBroker:
    """Minimal SSE manager for streaming run logs and events."""

    def __init__(self) -> None:
        self.queues: Dict[str, asyncio.Queue[tuple[str, str]]] = {}

    def create(self, run_id: str) -> asyncio.Queue[tuple[str, str]]:
        queue: asyncio.Queue[tuple[str, str]] = asyncio.Queue()
        self.queues[run_id] = queue
        return queue

    def push(self, run_id: str, message: str, event: str = "log") -> None:
        queue = self.queues.get(run_id)
        if queue is None:
            queue = self.create(run_id)
        queue.put_nowait((event, message))

    async def iterate(self, run_id: str):
        queue = self.queues.get(run_id)
        if queue is None:
            return
        while True:
            event, message = await queue.get()
            yield {"event": event, "data": message}

    def publish(self, run_id: str, event: Dict[str, Any]) -> None:
        queue = self.queues.setdefault(run_id, asyncio.Queue())
        queue.put_nowait(event)

    def subscribe(self, run_id: str) -> asyncio.Queue:
        return self.queues.setdefault(run_id, asyncio.Queue())


class ConfigLoader:
    """Loads backend configuration from YAML."""

    def __init__(self, path: Path) -> None:
        self.path = path

    def load(self) -> Dict[str, Any]:
        import yaml

        with self.path.open("r", encoding="utf-8") as handle:
            return yaml.safe_load(handle) or {}


class MasterRunner:
    """Wave 3 orchestrator for SIM, load, replay, reporting, bundling, and WAR ROOM."""

    def __init__(self) -> None:
        self.states: Dict[str, RunState] = {}
        self.sse = SSEBroker()
        self.replay_engine = ReplayEngine()
        self.store = MasterStore()
        self.warroom = WarroomLogger(store=self.store)

    def _log(self, run_id: str, message: str, event: str = "log") -> None:
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        line = f"[{timestamp}] {message}"
        state = self.states.setdefault(run_id, RunState(run_id=run_id))
        state.logs.append(line)
        self.sse.push(run_id, line, event=event)

    async def start_run(self, trigger: str = "api") -> str:
        run_id = str(uuid4())
        self.states[run_id] = RunState(
            run_id=run_id,
            status="RUNNING",
            progress=0.0,
            started_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
        self.sse.create(run_id)
        self.store.record_run_start(run_id)
        asyncio.create_task(self._execute(run_id, trigger))
        return run_id

    def _build_run_dir(self, run_id: str) -> Path:
        run_dir = REPORT_ROOT / run_id
        run_dir.mkdir(parents=True, exist_ok=True)
        return run_dir

    def _write_logs(self, run_id: str, run_dir: Path) -> Path:
        log_path = run_dir / "run.log"
        state = self.states[run_id]
        log_path.write_text("\n".join(state.logs), encoding="utf-8")
        return log_path

    def _emit_warroom(self, payload: Dict[str, Any]) -> None:
        run_id = payload.get("run_id", "")
        self.sse.push(run_id, json.dumps(payload), event="warroom")

    async def _execute(self, run_id: str, trigger: str) -> None:
        state = self.states[run_id]
        run_dir = self._build_run_dir(run_id)
        try:
            self._log(run_id, f"Run started via {trigger}")

            self._log(run_id, "Executing SIM runner", event="subsystem")
            sim_result = run_sim_suite(run_id)
            state.progress = 20
            state.results["sim_runner"] = sim_result

            self._log(run_id, "Executing k6 runner", event="subsystem")
            k6_result = run_k6_load(run_id)
            state.progress = 45
            state.results["k6_runner"] = k6_result

            latency_samples = self._synthetic_latencies(run_id)
            snapshot = {
                "run_id": run_id,
                "trigger": trigger,
                "started_at": state.started_at,
                "sim": sim_result,
                "k6": k6_result,
                "latency_samples": latency_samples,
            }
            snapshot_path = self.store.save_snapshot(run_id, snapshot)
            state.results["snapshot_path"] = str(snapshot_path)
            self._log(run_id, f"Snapshot written to {snapshot_path}")

            self._log(run_id, "Executing replay determinism", event="subsystem")
            replay_result = self.replay_engine.validate(snapshot)
            state.progress = 70
            state.results["replay_engine"] = replay_result

            pipeline_payload = {
                "t1": sim_result,
                "t2": k6_result,
                "t3": replay_result,
                "opus": {"escalations": sim_result.get("metrics", {}).get("escalations", [])},
                "contradictions": sim_result.get("metrics", {}).get("contradictions", 0),
                "confidence": sim_result.get("metrics", {}).get("determinism", 1.0),
                "latencies": latency_samples,
            }
            pipeline_status = run_checks(pipeline_payload)
            state.results["pipeline"] = pipeline_status

            warroom_event = None
            if not all([
                pipeline_status.get("t1_ok"),
                pipeline_status.get("t2_ok"),
                pipeline_status.get("t3_ok"),
                pipeline_status.get("latency_ok"),
            ]):
                warroom_event = self.warroom.log_event(
                    run_id,
                    subsystem="pipeline_checker",
                    severity="HIGH",
                    message="Pipeline validation detected issues",
                    suggestion="Inspect pipeline notes and subsystem outputs",
                )
                self._emit_warroom(warroom_event)

            summary = {
                "run_id": run_id,
                "status": "PASS" if pipeline_status.get("latency_ok") and not replay_result.get("drift_detected") else "WARN",
                "started_at": state.started_at,
                "finished_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "determinism_score": replay_result.get("determinism_score"),
                "latency_p95": k6_result.get("metrics", {}).get("p95_ms"),
                "bundle": None,
            }

            modules = [
                {"name": "SIM Suite", "status": sim_result.get("status"), "metrics": sim_result.get("metrics", {}), "notes": sim_result.get("notes", [])},
                {"name": "Load Test", "status": "PASS", "metrics": k6_result.get("metrics", {}), "notes": ["k6 synthetic run"]},
                {"name": "Replay Determinism", "status": "PASS" if not replay_result.get("drift_detected") else "FAIL", "metrics": replay_result, "notes": []},
                {"name": "Pipeline Checker", "status": "PASS" if all(v for k, v in pipeline_status.items() if k.endswith("_ok")) else "WARN", "metrics": pipeline_status, "notes": pipeline_status.get("notes", [])},
            ]

            reporter_payload = {
                "summary": summary,
                "subsystems": modules,
                "warroom": [warroom_event] if warroom_event else [],
                "snapshot": {"path": str(snapshot_path)},
                "latency_samples": latency_samples,
                "load_metrics": k6_result.get("metrics", {}),
                "pipeline_status": pipeline_status,
            }

            json_report = generate_json_report(run_id, reporter_payload)
            html_report = generate_html_report(run_id, reporter_payload)
            state.results["reports"] = {
                "json": str(json_report.json_path),
                "html": str(html_report.html_path),
            }

            sim_summary_path = run_dir / "sim_summary.json"
            sim_summary_path.write_text(json.dumps(sim_result, indent=2), encoding="utf-8")
            load_summary_path = run_dir / "load_summary.json"
            load_summary_path.write_text(json.dumps(k6_result, indent=2), encoding="utf-8")
            replay_summary_path = run_dir / "replay_summary.json"
            replay_summary_path.write_text(json.dumps(replay_result, indent=2), encoding="utf-8")
            log_path = self._write_logs(run_id, run_dir)

            bundle_path = create_bundle(
                run_id,
                {
                    "json_report": json_report.json_path,
                    "html_report": html_report.html_path,
                    "logs": log_path,
                    "snapshot": snapshot_path,
                    "sim_summary": sim_summary_path,
                    "load_summary": load_summary_path,
                    "replay_summary": replay_summary_path,
                },
            )
            summary["bundle"] = str(bundle_path)

            result_payload = {
                "summary": summary,
                "modules": modules,
                "pipeline": pipeline_status,
                "reports": {
                    "json": str(json_report.json_path),
                    "html": str(html_report.html_path),
                    "bundle": str(bundle_path),
                },
            }
            result_path = self.store.write_result_json(run_id, result_payload)
            self.store.save_report_paths(run_id, html_report.html_path, json_report.json_path, bundle_path)
            self.store.finalize_run(run_id, summary["status"], result_path=result_path, report_path=html_report.html_path, bundle_path=bundle_path)

            state.finished_at = summary["finished_at"]
            state.status = summary["status"]
            state.progress = 100
            self._log(run_id, f"Run completed with status {state.status}")
        except Exception as exc:  # pragma: no cover
            state.status = "FAIL"
            state.finished_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            state.results["error"] = str(exc)
            warroom_event = self.warroom.log_event(
                run_id,
                subsystem="master_runner",
                severity="CRITICAL",
                message=str(exc),
                suggestion="Inspect snapshot and replay inputs for corrupt state.",
            )
            self._emit_warroom(warroom_event)
            self._log(run_id, f"Run failed: {exc}")
            self.store.finalize_run(run_id, "FAIL")
        finally:
            self.states[run_id] = state

    def _synthetic_latencies(self, run_id: str) -> list[float]:
        rng = random.Random(run_id)
        return [round(rng.uniform(120, 420), 2) for _ in range(40)]

    def get_status(self, run_id: str) -> Optional[Dict[str, Any]]:
        state = self.states.get(run_id)
        if not state:
            return None
        return {
            "run_id": run_id,
            "validation": validation,
            "sim": sim_summary,
            "load": load_summary,
            "started_at": started_at,
        }
        replay_summary = replay_engine.replay(run_id, config.get("sim_seed", 1337), aggregated_snapshot)
        self._record_event(run_id, "replay_completed", {"summary": replay_summary})

        final = {
            "run_id": run_id,
            "validation": validation,
            "sim": sim_summary,
            "load": load_summary,
            "replay": replay_summary,
            "started_at": started_at,
            "ended_at": datetime.utcnow().isoformat() + "Z",
        }
        result_path = self.reports_dir / f"{run_id}_result.json"
        report_path = self.reports_dir / f"{run_id}_report.json"
        result_path.write_text(json.dumps(final, indent=2, sort_keys=True), encoding="utf-8")
        report_path.write_text(json.dumps({"metrics": final}, indent=2, sort_keys=True), encoding="utf-8")
        self.snapshot_store.save(run_id, "final", final)

        self._update_run(run_id, "completed", final["ended_at"], str(result_path), str(report_path))
        self._record_event(run_id, "run_completed", {"final": True, "result_path": str(result_path)})

    def status(self, run_id: str) -> Optional[RunRecord]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT run_id, status, started_at, ended_at, result_path, report_path FROM test_runs WHERE run_id = ?",
            (run_id,),
        )
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return RunRecord(*row)

    def load_json(self, path: Optional[str]) -> Optional[Dict[str, Any]]:
        if not path:
            return None
        file_path = Path(path)
        if not file_path.exists():
            return None
        return json.loads(file_path.read_text(encoding="utf-8"))


__all__ = ["MasterRunner", "RunEventBus", "RunRecord"]
