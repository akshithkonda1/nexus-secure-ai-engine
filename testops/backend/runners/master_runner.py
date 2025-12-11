"""Master orchestrator for TestOps backend Wave 1."""
from __future__ import annotations

import asyncio
import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from random import Random
from typing import Any, Dict, Optional
from uuid import uuid4

from testops.backend.loaders.k6_runner import K6Runner
from testops.backend.replay.replay_engine import ReplayEngine
from testops.backend.runners.engine_validator import EngineValidator
from testops.backend.simulators.sim_runner import SimRunner
from testops.backend.snapshots.snapshot_store import SnapshotStore
from testops.backend.warroom.warroom_logger import WarRoomLogger


@dataclass
class RunRecord:
    run_id: str
    status: str
    started_at: str
    ended_at: Optional[str]
    result_path: Optional[str]
    report_path: Optional[str]


class RunEventBus:
    """Lightweight per-run async event bus for SSE streaming."""

    def __init__(self) -> None:
        self.queues: Dict[str, asyncio.Queue] = {}

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
    """Coordinates engine validation, SIM runs, load tests, and replay."""

    def __init__(
        self,
        db_path: Path,
        config_path: Path,
        snapshot_store: SnapshotStore,
        event_bus: RunEventBus,
        warroom: WarRoomLogger,
    ) -> None:
        self.db_path = db_path
        self.config_path = config_path
        self.snapshot_store = snapshot_store
        self.event_bus = event_bus
        self.warroom = warroom
        self.base_dir = Path(__file__).resolve().parents[1]
        self.reports_dir = self.base_dir / "reports"
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        schema_path = self.base_dir / "db" / "schema.sql"
        schema_sql = schema_path.read_text(encoding="utf-8")
        with conn:
            conn.executescript(schema_sql)
        conn.close()

    def _insert_run(self, run_id: str, started_at: str) -> None:
        conn = sqlite3.connect(self.db_path)
        with conn:
            conn.execute(
                "INSERT OR REPLACE INTO test_runs(run_id, status, started_at, ended_at, result_path, report_path) VALUES (?, ?, ?, ?, ?, ?)",
                (run_id, "running", started_at, None, None, None),
            )
        conn.close()

    def _update_run(
        self,
        run_id: str,
        status: str,
        ended_at: Optional[str],
        result_path: Optional[str],
        report_path: Optional[str],
    ) -> None:
        conn = sqlite3.connect(self.db_path)
        with conn:
            conn.execute(
                "UPDATE test_runs SET status = ?, ended_at = ?, result_path = ?, report_path = ? WHERE run_id = ?",
                (status, ended_at, result_path, report_path, run_id),
            )
        conn.close()

    def _record_event(self, run_id: str, message: str, payload: Optional[Dict[str, Any]] = None) -> None:
        event = {"timestamp": datetime.utcnow().isoformat() + "Z", "message": message}
        if payload:
            event.update(payload)
        self.event_bus.publish(run_id, event)

    async def start_run(self) -> str:
        run_id = str(uuid4())
        started_at = datetime.utcnow().isoformat() + "Z"
        self._insert_run(run_id, started_at)
        self._record_event(run_id, "run_started", {"run_id": run_id})
        asyncio.create_task(self._execute(run_id, started_at))
        return run_id

    def _load_config(self) -> Dict[str, Any]:
        return ConfigLoader(self.config_path).load()

    async def _execute(self, run_id: str, started_at: str) -> None:
        config = self._load_config()
        rng = Random(config.get("sim_seed", 1337))
        validator = EngineValidator()
        sim_runner = SimRunner(self.base_dir / "simulators" / "sim_dataset.json", self.snapshot_store)
        k6_runner = K6Runner(self.base_dir / "loaders")
        replay_engine = ReplayEngine(self.base_dir / "snapshots")

        self._record_event(run_id, "engine_validation_started")
        validation = validator.validate()
        self.snapshot_store.save(run_id, "engine_validation", validation)
        if not validation.get("success") and config.get("fail_on_instability", True):
            self._record_event(run_id, "engine_validation_failed", {"validation": validation, "final": True})
            self._update_run(run_id, "failed", datetime.utcnow().isoformat() + "Z", None, None)
            self.warroom.log(run_id, "ERROR", "engine_validator", "Engine validation failed", "Inspect engine dependencies.")
            return
        self._record_event(run_id, "engine_validation_completed", {"validation": validation})

        self._record_event(run_id, "sim_runner_started")
        sim_summary = sim_runner.run_suite(run_id, rng)
        self._record_event(run_id, "sim_runner_completed", {"summary": sim_summary})

        self._record_event(run_id, "k6_runner_started")
        load_summary = k6_runner.run(run_id, rng)
        self.snapshot_store.save(run_id, "load_test", load_summary)
        self._record_event(run_id, "k6_runner_completed", {"summary": load_summary})

        aggregated_snapshot = {
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
