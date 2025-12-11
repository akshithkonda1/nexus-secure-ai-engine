from __future__ import annotations

import asyncio
import json
import sqlite3
import zipfile
from pathlib import Path
from typing import Dict

DATABASE_PATH = Path("database/tests_master.db")
REPORT_BASE = Path("reports/master")
SNAPSHOT_DIR = Path("snapshots")
LOAD_RESULTS_DIR = Path("load_results")
LOG_DIR = Path("warroom/master")


class TestStore:
    def __init__(self, db_path: Path | str = DATABASE_PATH):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        REPORT_BASE.mkdir(parents=True, exist_ok=True)
        SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
        LOAD_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self.log_queues: Dict[str, asyncio.Queue] = {}

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        conn = self._connect()
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS runs (
                run_id TEXT PRIMARY KEY,
                status TEXT,
                progress INTEGER,
                current_stage TEXT,
                result_json TEXT
            )
            """
        )
        conn.commit()
        conn.close()

    def init_run(self, run_id: str) -> None:
        conn = self._connect()
        cur = conn.cursor()
        cur.execute(
            "INSERT OR REPLACE INTO runs(run_id, status, progress, current_stage, result_json) VALUES (?, ?, ?, ?, ?)",
            (run_id, "running", 0, "initializing", None),
        )
        conn.commit()
        conn.close()
        self.log_queues[run_id] = asyncio.Queue()

    def add_log(self, run_id: str, message: str) -> None:
        queue = self.log_queues.setdefault(run_id, asyncio.Queue())
        queue.put_nowait(message)
        log_file = LOG_DIR / f"{run_id}.log"
        with log_file.open("a", encoding="utf-8") as handle:
            handle.write(message + "\n")

    def get_log_queue(self, run_id: str) -> asyncio.Queue:
        return self.log_queues.setdefault(run_id, asyncio.Queue())

    def update_progress(self, run_id: str, progress: int, stage: str) -> None:
        conn = self._connect()
        cur = conn.cursor()
        cur.execute(
            "UPDATE runs SET progress=?, current_stage=? WHERE run_id=?",
            (progress, stage, run_id),
        )
        conn.commit()
        conn.close()

    def save_result(self, run_id: str, result: dict) -> None:
        conn = self._connect()
        cur = conn.cursor()
        cur.execute(
            "UPDATE runs SET status=?, result_json=? WHERE run_id=?",
            ("finished", json.dumps(result), run_id),
        )
        conn.commit()
        conn.close()

    def get_status(self, run_id: str) -> dict:
        conn = self._connect()
        cur = conn.cursor()
        row = cur.execute(
            "SELECT status, progress, current_stage FROM runs WHERE run_id=?", (run_id,)
        ).fetchone()
        conn.close()
        if not row:
            return {"error": "run_id not found"}
        return {"run_id": run_id, "status": row[0], "progress": row[1], "current_stage": row[2]}

    def get_result(self, run_id: str) -> dict:
        conn = self._connect()
        cur = conn.cursor()
        row = cur.execute("SELECT result_json FROM runs WHERE run_id=?", (run_id,)).fetchone()
        conn.close()
        if not row or row[0] is None:
            return {"error": "not found"}
        return json.loads(row[0])

    def get_report_path(self, run_id: str) -> str:
        return str(REPORT_BASE / run_id / "report.html")

    def build_bundle(self, run_id: str) -> str:
        base = REPORT_BASE / run_id
        base.mkdir(parents=True, exist_ok=True)
        bundle_path = base / "bundle.zip"
        with zipfile.ZipFile(bundle_path, "w") as zf:
            for file in base.glob("*"):
                if file.name != "bundle.zip":
                    zf.write(file, arcname=file.name)
        return str(bundle_path)


__all__ = [
    "TestStore",
    "DATABASE_PATH",
    "REPORT_BASE",
    "SNAPSHOT_DIR",
    "LOAD_RESULTS_DIR",
    "LOG_DIR",
]
