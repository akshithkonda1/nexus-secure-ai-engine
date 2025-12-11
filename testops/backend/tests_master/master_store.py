"""SQLite persistence layer for TestOps master runs."""
from __future__ import annotations

import json
import sqlite3
import time
from pathlib import Path
from typing import Any, Dict, Optional

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DB_PATH = BACKEND_ROOT / "database" / "tests_master.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


class MasterStore:
    def __init__(self) -> None:
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(DB_PATH)

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS test_runs (
                    run_id TEXT PRIMARY KEY,
                    started_at TEXT,
                    finished_at TEXT,
                    status TEXT,
                    result_json TEXT,
                    report_path TEXT,
                    snapshot_path TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS test_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id TEXT,
                    timestamp TEXT,
                    message TEXT
                )
                """
            )
            conn.commit()

    def record_run(self, run_id: str, status: str, started_at: Optional[str] = None) -> None:
        started_at = started_at or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        with self._connect() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO test_runs(run_id, started_at, status) VALUES (?, ?, ?)",
                (run_id, started_at, status),
            )
            conn.commit()

    def update_status(
        self,
        run_id: str,
        status: Optional[str] = None,
        result_json: Optional[str] = None,
        report_path: Optional[str] = None,
        snapshot_path: Optional[str] = None,
        finished_at: Optional[str] = None,
    ) -> None:
        finished_at = finished_at or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()) if status in {"PASS", "FAIL"} else None
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE test_runs
                SET status = COALESCE(?, status),
                    result_json = COALESCE(?, result_json),
                    report_path = COALESCE(?, report_path),
                    snapshot_path = COALESCE(?, snapshot_path),
                    finished_at = COALESCE(?, finished_at)
                WHERE run_id = ?
                """,
                (status, result_json, report_path, snapshot_path, finished_at, run_id),
            )
            conn.commit()

    def log(self, run_id: str, message: str, timestamp: Optional[str] = None) -> None:
        timestamp = timestamp or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO test_logs(run_id, timestamp, message) VALUES (?, ?, ?)",
                (run_id, timestamp, message),
            )
            conn.commit()

    def save_result(self, run_id: str, payload: Dict[str, Any]) -> None:
        with self._connect() as conn:
            conn.execute(
                "UPDATE test_runs SET result_json = ? WHERE run_id = ?",
                (json.dumps(payload), run_id),
            )
            conn.commit()

    def fetch_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT run_id, started_at, finished_at, status, result_json, report_path, snapshot_path FROM test_runs WHERE run_id = ?",
                (run_id,),
            ).fetchone()
            if not row:
                return None
            keys = ["run_id", "started_at", "finished_at", "status", "result_json", "report_path", "snapshot_path"]
            payload = dict(zip(keys, row))
            if payload.get("result_json"):
                payload["result_json"] = json.loads(payload["result_json"])
            return payload

    def fetch_result(self, run_id: str) -> Optional[Dict[str, Any]]:
        record = self.fetch_run(run_id)
        return record.get("result_json") if record else None

    def fetch_logs(self, run_id: str) -> Any:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT timestamp, message FROM test_logs WHERE run_id = ? ORDER BY id ASC",
                (run_id,),
            ).fetchall()
        return [f"[{ts}] {msg}" for ts, msg in rows]


__all__ = ["MasterStore", "DB_PATH"]
