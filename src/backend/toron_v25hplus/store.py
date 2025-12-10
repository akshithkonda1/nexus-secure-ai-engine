from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any, Dict, Iterable, List, Optional


class TestStore:
    """SQLite-backed store for Toron v2.5H+ control plane."""

    def __init__(self, db_path: Path):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()
        self._ensure_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS test_runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id TEXT,
                    test_type TEXT,
                    scope TEXT,
                    status TEXT,
                    duration REAL,
                    metadata TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS sim_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id TEXT,
                    scenario TEXT,
                    result TEXT,
                    passed INTEGER,
                    latency_ms INTEGER
                );

                CREATE TABLE IF NOT EXISTS load_test_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id TEXT,
                    profile TEXT,
                    status TEXT,
                    tps INTEGER,
                    errors INTEGER,
                    duration REAL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS war_room_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    severity TEXT,
                    message TEXT,
                    action TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    snapshot_id TEXT,
                    run_id TEXT,
                    summary TEXT,
                    payload TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );
                """
            )

    def reset(self) -> None:
        """Clear all persisted rows (primarily used for tests)."""
        with self._connect() as conn:
            conn.executescript(
                """
                DELETE FROM test_runs;
                DELETE FROM sim_results;
                DELETE FROM load_test_logs;
                DELETE FROM war_room_events;
                DELETE FROM snapshots;
                """
            )

    def _stamp(self) -> str:
        return datetime.utcnow().isoformat()

    def _persist_run(self, test_type: str, scope: str, status: str, duration: float, metadata: Dict[str, Any]) -> str:
        with self._lock:
            with self._connect() as conn:
                cursor = conn.execute(
                    """
                    INSERT INTO test_runs(test_type, scope, status, duration, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (test_type, scope, status, duration, json.dumps(metadata), self._stamp()),
                )
                pk = cursor.lastrowid
                run_id = f"{test_type.upper()}-{pk:05d}"
                conn.execute("UPDATE test_runs SET run_id=? WHERE id=?", (run_id, pk))
                return run_id

    def _persist_snapshot(self, run_id: str, summary: str, payload: Dict[str, Any]) -> str:
        with self._lock:
            with self._connect() as conn:
                cursor = conn.execute(
                    "INSERT INTO snapshots(run_id, summary, payload, created_at) VALUES (?, ?, ?, ?)",
                    (run_id, summary, json.dumps(payload), self._stamp()),
                )
                snapshot_id = f"SNAP-{cursor.lastrowid:05d}"
                conn.execute("UPDATE snapshots SET snapshot_id=? WHERE id=?", (snapshot_id, cursor.lastrowid))
                return snapshot_id

    def record_sim_run(
        self, scope: str, scenarios: Iterable[str], status: str = "completed", duration: float = 1.2
    ) -> Dict[str, Any]:
        metadata = {"scenarios": list(scenarios), "kind": scope}
        run_id = self._persist_run("sim", scope, status, duration, metadata)
        with self._connect() as conn:
            for scenario in scenarios:
                conn.execute(
                    "INSERT INTO sim_results(run_id, scenario, result, passed, latency_ms) VALUES (?, ?, ?, ?, ?)",
                    (run_id, scenario, "ok", 1, 120 + len(scenario) * 3),
                )
        snapshot_id = self._persist_snapshot(
            run_id, summary=f"Snapshot for {scope} run", payload={"scenarios": list(scenarios), "status": status}
        )
        return {"run_id": run_id, "snapshot_id": snapshot_id}

    def record_load_run(self, profile: str, duration: float, virtual_users: int) -> str:
        metadata = {"profile": profile, "vus": virtual_users}
        run_id = self._persist_run("load", profile, "completed", duration, metadata)
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO load_test_logs(run_id, profile, status, tps, errors, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (run_id, profile, "completed", 1200, 2, duration, self._stamp()),
            )
        return run_id

    def record_war_room(self, severity: str, message: str, action: str) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO war_room_events(severity, message, action, created_at) VALUES (?, ?, ?, ?)",
                (severity, message, action, self._stamp()),
            )

    def history(self) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT run_id, test_type, scope, status, duration, metadata, created_at FROM test_runs ORDER BY id DESC"
            ).fetchall()
        return [self._row_to_dict(row) for row in rows]

    def snapshots(self) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT snapshot_id, run_id, summary, payload, created_at FROM snapshots ORDER BY id DESC"
            ).fetchall()
        return [self._row_to_snapshot(row) for row in rows]

    def snapshot(self, snapshot_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT snapshot_id, run_id, summary, payload, created_at FROM snapshots WHERE snapshot_id=?",
                (snapshot_id,),
            ).fetchone()
        return self._row_to_snapshot(row) if row else None

    def diff_snapshots(self, source_id: str, target_id: str) -> Dict[str, Any]:
        source = self.snapshot(source_id)
        target = self.snapshot(target_id)
        return {
            "source": source,
            "target": target,
            "delta": self._compute_delta(source or {}, target or {}),
        }

    def stability_metrics(self) -> Dict[str, Any]:
        with self._connect() as conn:
            total = conn.execute("SELECT COUNT(*) FROM sim_results").fetchone()[0]
            passed = conn.execute("SELECT COUNT(*) FROM sim_results WHERE passed=1").fetchone()[0]
        stability = (passed / total) * 100 if total else 100.0
        return {
            "stability": round(stability, 2),
            "total_cases": total,
            "passed": passed,
            "failed": total - passed,
        }

    def live_metrics(self) -> Dict[str, Any]:
        with self._connect() as conn:
            sim_runs = conn.execute("SELECT COUNT(*) FROM test_runs WHERE test_type='sim'").fetchone()[0]
            load_runs = conn.execute("SELECT COUNT(*) FROM test_runs WHERE test_type='load'").fetchone()[0]
            open_events = conn.execute("SELECT COUNT(*) FROM war_room_events").fetchone()[0]
        stability = self.stability_metrics()
        return {
            "sim_runs": sim_runs,
            "load_runs": load_runs,
            "open_events": open_events,
            "stability": stability.get("stability"),
        }

    def load_metrics(self, run_id: str) -> Dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT run_id, profile, status, tps, errors, duration, created_at FROM load_test_logs WHERE run_id=?",
                (run_id,),
            ).fetchone()
        if not row:
            return {"run_id": run_id, "status": "not_found"}
        return {
            "run_id": row["run_id"],
            "profile": row["profile"],
            "status": row["status"],
            "tps": row["tps"],
            "errors": row["errors"],
            "duration": row["duration"],
            "created_at": row["created_at"],
        }

    def war_room(self) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT severity, message, action, created_at FROM war_room_events ORDER BY id DESC"
            ).fetchall()
        return [dict(row) for row in rows]

    @staticmethod
    def _compute_delta(source: Dict[str, Any], target: Dict[str, Any]) -> Dict[str, Any]:
        source_payload = source.get("payload", {}) if isinstance(source, dict) else {}
        target_payload = target.get("payload", {}) if isinstance(target, dict) else {}
        changes = []
        for key in sorted(set(source_payload.keys()) | set(target_payload.keys())):
            changes.append(
                {
                    "field": key,
                    "from": source_payload.get(key),
                    "to": target_payload.get(key),
                    "status": "changed" if source_payload.get(key) != target_payload.get(key) else "unchanged",
                }
            )
        return {"changes": changes, "summary": f"Compared {len(changes)} fields"}

    @staticmethod
    def _row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
        data = dict(row)
        if data.get("metadata"):
            data["metadata"] = json.loads(data["metadata"])
        return data

    @staticmethod
    def _row_to_snapshot(row: Optional[sqlite3.Row]) -> Optional[Dict[str, Any]]:
        if row is None:
            return None
        data = dict(row)
        if data.get("payload"):
            data["payload"] = json.loads(data["payload"])
        return data


def _default_store() -> TestStore:
    db_env = os.getenv("RYUZEN_TORON_V25H_DB")
    if db_env:
        path = Path(db_env)
    else:
        path = Path(__file__).resolve().parent / "data" / "ryuzen_toron_v25hplus.db"
    return TestStore(path)


store = _default_store()

__all__ = ["TestStore", "store"]
