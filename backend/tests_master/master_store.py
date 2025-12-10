import json
import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional

DB_PATH = "database/tests_master.db"


class MasterStore:
    def __init__(self, db_path: str = DB_PATH):
        os.makedirs("database", exist_ok=True)
        self.db_path = db_path
        self._init()

    def _conn(self):
        return sqlite3.connect(self.db_path)

    def _ensure_columns(self, cur: sqlite3.Cursor, table: str, column: str, definition: str) -> None:
        cur.execute(f"PRAGMA table_info({table})")
        columns = {row[1] for row in cur.fetchall()}
        if column not in columns:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")

    def _init(self):
        conn = self._conn()
        cur = conn.cursor()

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS test_runs (
                run_id TEXT PRIMARY KEY,
                status TEXT,
                progress REAL,
                phase TEXT,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS test_results (
                run_id TEXT PRIMARY KEY,
                result_json TEXT,
                created_at TEXT
            )
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS warroom_events (
                run_id TEXT,
                timestamp TEXT,
                severity TEXT,
                message TEXT
            )
            """
        )

        self._ensure_columns(cur, "test_runs", "progress", "REAL")
        self._ensure_columns(cur, "test_runs", "phase", "TEXT")

        conn.commit()
        conn.close()

    def create_run(self, run_id: str):
        now = datetime.utcnow().isoformat()
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO test_runs (run_id, status, progress, phase, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (run_id, "started", 0.0, "initializing", now, now),
        )
        conn.commit()
        conn.close()

    def update_status(self, run_id: str, status: str, *, progress: float, phase: str):
        now = datetime.utcnow().isoformat()
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "UPDATE test_runs SET status=?, progress=?, phase=?, updated_at=? WHERE run_id=?",
            (status, progress, phase, now, run_id),
        )
        conn.commit()
        conn.close()

    def save_result(self, run_id: str, result: Dict[str, Any]):
        now = datetime.utcnow().isoformat()
        payload = json.dumps(result, sort_keys=True)
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO test_results (run_id, result_json, created_at) VALUES (?, ?, ?)",
            (run_id, payload, now),
        )
        conn.commit()
        conn.close()

    def get_status(self, run_id: str) -> Optional[Dict[str, Any]]:
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT status, progress, phase, created_at, updated_at FROM test_runs WHERE run_id=?",
            (run_id,),
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        status, progress, phase, created_at, updated_at = row
        return {
            "status": status,
            "progress": progress,
            "phase": phase,
            "created_at": created_at,
            "updated_at": updated_at,
        }

    def list_runs(self) -> List[Dict[str, Any]]:
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT run_id, status, progress, phase, created_at, updated_at FROM test_runs ORDER BY datetime(created_at) DESC"
        )
        rows = cur.fetchall()
        conn.close()
        results: List[Dict[str, Any]] = []
        for run_id, status, progress, phase, created_at, updated_at in rows:
            results.append(
                {
                    "run_id": run_id,
                    "status": status,
                    "progress": progress,
                    "phase": phase,
                    "created_at": created_at,
                    "updated_at": updated_at,
                }
            )
        return results

    def get_result(self, run_id: str) -> Optional[Dict[str, Any]]:
        conn = self._conn()
        cur = conn.cursor()
        cur.execute("SELECT result_json FROM test_results WHERE run_id=?", (run_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        try:
            return json.loads(row[0])
        except json.JSONDecodeError:
            return None

    def record_warroom(self, run_id: str, severity: str, message: str, timestamp: Optional[str] = None) -> None:
        ts = timestamp or datetime.utcnow().isoformat()
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO warroom_events (run_id, timestamp, severity, message) VALUES (?, ?, ?, ?)",
            (run_id, ts, severity, message),
        )
        conn.commit()
        conn.close()

    def get_warroom_events(self, run_id: str) -> List[Dict[str, Any]]:
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT timestamp, severity, message FROM warroom_events WHERE run_id=? ORDER BY datetime(timestamp) DESC",
            (run_id,),
        )
        rows = cur.fetchall()
        conn.close()
        return [
            {"timestamp": ts, "severity": severity, "message": message} for ts, severity, message in rows
        ]
