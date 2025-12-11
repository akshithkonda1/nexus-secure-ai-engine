"""SQLite persistence layer for TestOps master runs (Section 3)."""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DB_PATH = BACKEND_ROOT / "database" / "tests_master.db"
SCHEMA_PATH = BACKEND_ROOT / "db" / "schema.sql"

DB_PATH.parent.mkdir(parents=True, exist_ok=True)
SCHEMA_PATH.parent.mkdir(parents=True, exist_ok=True)


class MasterStore:
    def __init__(self) -> None:
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        if not SCHEMA_PATH.exists():
            raise FileNotFoundError(f"Missing schema file at {SCHEMA_PATH}")
        schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
        with self._connect() as conn:
            conn.executescript(schema_sql)
            conn.commit()

    def record_run(self, run_id: str, status: str, triggered_by: str | None = None, started_at: str | None = None) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO test_runs(run_id, triggered_by, started_at, status)
                VALUES(?, COALESCE(?, triggered_by), COALESCE(?, started_at, strftime('%Y-%m-%dT%H:%M:%fZ','now')), ?)
                """,
                (run_id, triggered_by, started_at, status),
            )
            conn.commit()

    def append_log(self, run_id: str, message: str, timestamp: str, level: str = "INFO") -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO run_logs(run_id, timestamp, level, message) VALUES (?, ?, ?, ?)",
                (run_id, timestamp, level, message),
            )
            conn.commit()

    def save_module_result(self, run_id: str, module_name: str, status: str, metrics: Dict[str, Any], notes: Iterable[str]) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO module_results(run_id, module_name, status, metrics, notes)
                VALUES(?, ?, ?, ?, ?)
                """,
                (run_id, module_name, status, json.dumps(metrics), json.dumps(list(notes))),
            )
            conn.commit()

    def attach_artifact(self, run_id: str, artifact_type: str, artifact_path: Path) -> None:
        if not artifact_path.exists():
            raise FileNotFoundError(f"Artifact path missing: {artifact_path}")
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO run_artifacts(run_id, artifact_type, artifact_path) VALUES(?, ?, ?)",
                (run_id, artifact_type, str(artifact_path)),
            )
            conn.commit()

    def finalize_run(
        self,
        run_id: str,
        status: str,
        determinism_score: float | None = None,
        latency_p99: float | None = None,
        finished_at: str | None = None,
        artifact_bundle: Path | None = None,
    ) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE test_runs
                SET status = ?,
                    determinism_score = COALESCE(?, determinism_score),
                    latency_p99 = COALESCE(?, latency_p99),
                    finished_at = COALESCE(?, finished_at, strftime('%Y-%m-%dT%H:%M:%fZ','now')),
                    artifact_bundle = COALESCE(?, artifact_bundle)
                WHERE run_id = ?
                """,
                (status, determinism_score, latency_p99, finished_at, str(artifact_bundle) if artifact_bundle else None, run_id),
            )
            conn.commit()

    def fetch_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            run_row = conn.execute("SELECT * FROM test_runs WHERE run_id = ?", (run_id,)).fetchone()
            if not run_row:
                return None
            modules = [
                {
                    "name": row["module_name"],
                    "status": row["status"],
                    "metrics": json.loads(row["metrics"] or "{}"),
                    "notes": json.loads(row["notes"] or "[]"),
                }
                for row in conn.execute("SELECT * FROM module_results WHERE run_id = ?", (run_id,)).fetchall()
            ]
            artifacts = [dict(row) for row in conn.execute("SELECT artifact_type, artifact_path FROM run_artifacts WHERE run_id = ?", (run_id,)).fetchall()]
            logs = [dict(row) for row in conn.execute("SELECT timestamp, level, message FROM run_logs WHERE run_id = ? ORDER BY id ASC", (run_id,)).fetchall()]
        payload: Dict[str, Any] = dict(run_row)
        payload["modules"] = modules
        payload["artifacts"] = artifacts
        payload["logs"] = logs
        return payload

    def fetch_logs(self, run_id: str) -> List[Dict[str, str]]:
        with self._connect() as conn:
            return [
                {"timestamp": row["timestamp"], "level": row["level"], "message": row["message"]}
                for row in conn.execute("SELECT timestamp, level, message FROM run_logs WHERE run_id = ? ORDER BY id ASC", (run_id,))
            ]


__all__ = ["MasterStore", "DB_PATH", "SCHEMA_PATH"]
