from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Dict, List, Optional

DATABASE_PATH = Path("backend/database/tests_master.db")


def _ensure_schema() -> None:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DATABASE_PATH) as conn:
        cur = conn.cursor()
        cur.execute(
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
        cur.execute(
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


def create_run(run_id: str, started_at: str) -> None:
    _ensure_schema()
    with sqlite3.connect(DATABASE_PATH) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO test_runs (run_id, started_at, status) VALUES (?, ?, ?)",
            (run_id, started_at, "RUNNING"),
        )
        conn.commit()


def update_run(
    run_id: str,
    *,
    finished_at: Optional[str] = None,
    status: Optional[str] = None,
    result_json: Optional[Dict] = None,
    report_path: Optional[str] = None,
    snapshot_path: Optional[str] = None,
) -> None:
    _ensure_schema()
    with sqlite3.connect(DATABASE_PATH) as conn:
        current = conn.execute("SELECT result_json FROM test_runs WHERE run_id=?", (run_id,)).fetchone()
        existing_json = json.loads(current[0]) if current and current[0] else {}
        if result_json:
            existing_json.update(result_json)
        conn.execute(
            """
            UPDATE test_runs
            SET finished_at = COALESCE(?, finished_at),
                status = COALESCE(?, status),
                result_json = ?,
                report_path = COALESCE(?, report_path),
                snapshot_path = COALESCE(?, snapshot_path)
            WHERE run_id = ?
            """,
            (
                finished_at,
                status,
                json.dumps(existing_json),
                report_path,
                snapshot_path,
                run_id,
            ),
        )
        conn.commit()


def append_log(run_id: str, timestamp: str, message: str) -> None:
    _ensure_schema()
    with sqlite3.connect(DATABASE_PATH) as conn:
        conn.execute(
            "INSERT INTO test_logs (run_id, timestamp, message) VALUES (?, ?, ?)",
            (run_id, timestamp, message),
        )
        conn.commit()


def get_run(run_id: str) -> Optional[Dict]:
    _ensure_schema()
    with sqlite3.connect(DATABASE_PATH) as conn:
        row = conn.execute(
            "SELECT run_id, started_at, finished_at, status, result_json, report_path, snapshot_path FROM test_runs WHERE run_id=?",
            (run_id,),
        ).fetchone()
        if not row:
            return None
        return {
            "run_id": row[0],
            "started_at": row[1],
            "finished_at": row[2],
            "status": row[3],
            "result_json": json.loads(row[4]) if row[4] else {},
            "report_path": row[5],
            "snapshot_path": row[6],
        }


def list_logs(run_id: str) -> List[Dict]:
    _ensure_schema()
    with sqlite3.connect(DATABASE_PATH) as conn:
        rows = conn.execute(
            "SELECT timestamp, message FROM test_logs WHERE run_id=? ORDER BY id ASC",
            (run_id,),
        ).fetchall()
        return [{"timestamp": ts, "message": msg} for ts, msg in rows]
