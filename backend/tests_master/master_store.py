"""Storage utilities for master test runs using SQLite and the filesystem."""
from __future__ import annotations

import datetime as dt
import json
import sqlite3
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from .master_models import RunStatus, RunSummary

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "tests_master.db"
LOG_DIR = BASE_DIR.parent / "logs" / "master"
REPORT_DIR = BASE_DIR.parent / "reports" / "master"
LOAD_RESULTS_DIR = BASE_DIR.parent / "load_results"
WARROOM_DIR = BASE_DIR.parent / "warroom" / "master"
SNAPSHOT_DIR = BASE_DIR.parent / "snapshots"

for directory in [LOG_DIR, REPORT_DIR, LOAD_RESULTS_DIR, WARROOM_DIR, SNAPSHOT_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS runs (
            run_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            percent REAL DEFAULT 0,
            summary TEXT,
            started_at TEXT,
            finished_at TEXT
        );
        """
    )
    return conn


def set_run_started(run_id: str) -> None:
    now = dt.datetime.utcnow().isoformat()
    with _connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO runs (run_id, status, percent, started_at) VALUES (?, ?, ?, ?)",
            (run_id, RunStatus.STARTED.value, 0.0, now),
        )
        conn.commit()


def update_progress(run_id: str, percent: float, status: RunStatus = RunStatus.RUNNING) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE runs SET percent = ?, status = ? WHERE run_id = ?",
            (percent, status.value, run_id),
        )
        conn.commit()


def finalize_run(run_id: str, status: RunStatus) -> None:
    finished = dt.datetime.utcnow().isoformat()
    with _connect() as conn:
        conn.execute(
            "UPDATE runs SET status = ?, finished_at = ?, percent = ? WHERE run_id = ?",
            (status.value, finished, 100.0 if status == RunStatus.COMPLETED else 0.0, run_id),
        )
        conn.commit()


def save_summary(run_id: str, summary: RunSummary) -> Path:
    summary_path = REPORT_DIR / f"{run_id}.json"
    with summary_path.open("w", encoding="utf-8") as handle:
        json.dump(summary.dict(), handle, indent=2)
    with _connect() as conn:
        conn.execute(
            "UPDATE runs SET summary = ?, status = ?, finished_at = ?, percent = ? WHERE run_id = ?",
            (
                summary_path.read_text(),
                summary.status.value,
                (summary.finished_at or dt.datetime.utcnow()).isoformat(),
                100.0,
                run_id,
            ),
        )
        conn.commit()
    return summary_path


def get_run(run_id: str) -> Optional[Tuple[str, str, float, Optional[str], Optional[str], Optional[str]]]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT run_id, status, percent, summary, started_at, finished_at FROM runs WHERE run_id = ?",
            (run_id,),
        ).fetchone()
    return row


def get_summary_json(run_id: str) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute("SELECT summary FROM runs WHERE run_id = ?", (run_id,)).fetchone()
    if not row or not row[0]:
        return None
    try:
        return json.loads(row[0])
    except json.JSONDecodeError:
        return None


__all__ = [
    "DB_PATH",
    "LOG_DIR",
    "REPORT_DIR",
    "LOAD_RESULTS_DIR",
    "WARROOM_DIR",
    "SNAPSHOT_DIR",
    "set_run_started",
    "update_progress",
    "finalize_run",
    "save_summary",
    "get_run",
    "get_summary_json",
]
