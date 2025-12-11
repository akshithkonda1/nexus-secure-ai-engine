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
                CREATE TABLE IF NOT EXISTS runs (
                    run_id TEXT PRIMARY KEY,
                    status TEXT,
                    started_at REAL,
                    updated_at REAL,
                    result_path TEXT,
                    error TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS results (
                    run_id TEXT PRIMARY KEY,
                    payload TEXT
                )
                """
            )
            conn.commit()

    def record_run(self, run_id: str, status: str) -> None:
        now = time.time()
        with self._connect() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO runs(run_id, status, started_at, updated_at) VALUES (?, ?, ?, ?)",
                (run_id, status, now, now),
            )
            conn.commit()

    def update_status(self, run_id: str, status: str, error: Optional[str] = None, result_path: Optional[str] = None) -> None:
        with self._connect() as conn:
            conn.execute(
                "UPDATE runs SET status = ?, updated_at = ?, error = COALESCE(?, error), result_path = COALESCE(?, result_path) WHERE run_id = ?",
                (status, time.time(), error, result_path, run_id),
            )
            conn.commit()

    def save_result(self, run_id: str, payload: Dict[str, Any]) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO results(run_id, payload) VALUES (?, ?)",
                (run_id, json.dumps(payload)),
            )
            conn.commit()

    def fetch_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT run_id, status, started_at, updated_at, result_path, error FROM runs WHERE run_id = ?",
                (run_id,),
            ).fetchone()
            if not row:
                return None
            keys = ["run_id", "status", "started_at", "updated_at", "result_path", "error"]
            return dict(zip(keys, row))

    def fetch_result(self, run_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute("SELECT payload FROM results WHERE run_id = ?", (run_id,)).fetchone()
            if not row:
                return None
            return json.loads(row[0])


__all__ = ["MasterStore", "DB_PATH"]
