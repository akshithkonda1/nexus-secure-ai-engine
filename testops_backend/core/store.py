import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional
from .config import DB_PATH


SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
    run_id TEXT PRIMARY KEY,
    status TEXT,
    summary TEXT,
    created_at TEXT,
    updated_at TEXT
);
CREATE TABLE IF NOT EXISTS logs (
    run_id TEXT,
    timestamp TEXT,
    level TEXT,
    message TEXT
);
CREATE TABLE IF NOT EXISTS results (
    run_id TEXT,
    payload TEXT
);
"""


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    return conn


def init_db() -> None:
    conn = get_connection()
    with conn:
        conn.executescript(SCHEMA)
    conn.close()


def create_run(run_id: str, created_at: str) -> None:
    conn = get_connection()
    with conn:
        conn.execute(
            "INSERT OR REPLACE INTO runs(run_id, status, summary, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (run_id, "pending", "", created_at, created_at),
        )
    conn.close()


def update_status(run_id: str, status: str, summary: str, updated_at: str) -> None:
    conn = get_connection()
    with conn:
        conn.execute(
            "UPDATE runs SET status=?, summary=?, updated_at=? WHERE run_id=?",
            (status, summary, updated_at, run_id),
        )
    conn.close()


def append_log(run_id: str, timestamp: str, level: str, message: str) -> None:
    conn = get_connection()
    with conn:
        conn.execute(
            "INSERT INTO logs(run_id, timestamp, level, message) VALUES (?, ?, ?, ?)",
            (run_id, timestamp, level, message),
        )
    conn.close()


def save_result(run_id: str, payload: Dict[str, Any]) -> None:
    conn = get_connection()
    with conn:
        conn.execute(
            "INSERT INTO results(run_id, payload) VALUES (?, ?)",
            (run_id, json.dumps(payload)),
        )
    conn.close()


def get_run(run_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT run_id, status, summary, created_at, updated_at FROM runs WHERE run_id=?", (run_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "run_id": row[0],
        "status": row[1],
        "summary": row[2],
        "created_at": row[3],
        "updated_at": row[4],
    }


def get_runs(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT run_id, status, summary, created_at, updated_at FROM runs ORDER BY created_at DESC LIMIT ?",
        (limit,),
    )
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "run_id": row[0],
            "status": row[1],
            "summary": row[2],
            "created_at": row[3],
            "updated_at": row[4],
        }
        for row in rows
    ]


def get_result(run_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT payload FROM results WHERE run_id=?", (run_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return json.loads(row[0])
