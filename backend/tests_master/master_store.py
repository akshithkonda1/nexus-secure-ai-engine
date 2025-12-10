import sqlite3
from datetime import datetime
from typing import Optional, Dict, Any
import os

DB_PATH = "database/tests_master.db"


class MasterStore:
    def __init__(self, db_path: str = DB_PATH):
        os.makedirs("database", exist_ok=True)
        self.db_path = db_path
        self._init()

    def _conn(self):
        return sqlite3.connect(self.db_path)

    def _init(self):
        conn = self._conn()
        cur = conn.cursor()

        cur.execute("""
        CREATE TABLE IF NOT EXISTS test_runs (
            run_id TEXT PRIMARY KEY,
            status TEXT,
            created_at TEXT,
            updated_at TEXT
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS test_results (
            run_id TEXT PRIMARY KEY,
            result_json TEXT,
            created_at TEXT
        )
        """)

        conn.commit()
        conn.close()

    def create_run(self, run_id: str):
        now = datetime.utcnow().isoformat()
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO test_runs (run_id, status, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (run_id, "started", now, now),
        )
        conn.commit()
        conn.close()

    def update_status(self, run_id: str, status: str):
        now = datetime.utcnow().isoformat()
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "UPDATE test_runs SET status=?, updated_at=? WHERE run_id=?",
            (status, now, run_id),
        )
        conn.commit()
        conn.close()

    def save_result(self, run_id: str, result_json: str):
        now = datetime.utcnow().isoformat()
        conn = self._conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO test_results (run_id, result_json, created_at) VALUES (?, ?, ?)",
            (run_id, result_json, now),
        )
        conn.commit()
        conn.close()

    def get_status(self, run_id: str) -> Optional[str]:
        conn = self._conn()
        cur = conn.cursor()
        cur.execute("SELECT status FROM test_runs WHERE run_id=?", (run_id,))
        row = cur.fetchone()
        conn.close()
        return row[0] if row else None
