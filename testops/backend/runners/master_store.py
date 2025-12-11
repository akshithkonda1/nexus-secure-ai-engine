"""Persistence layer for TestOps Wave 3.

Responsibilities:
- Write result JSON payloads per run
- Track report paths in SQLite
- Store and retrieve snapshots
- Provide lightweight test history for the frontend
"""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Optional

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DB_PATH = BACKEND_ROOT / "database" / "tests_master.db"
SCHEMA_PATH = BACKEND_ROOT / "db" / "schema.sql"
REPORT_ROOT = BACKEND_ROOT / "reports"
SNAPSHOT_ROOT = BACKEND_ROOT / "snapshots"

DB_PATH.parent.mkdir(parents=True, exist_ok=True)
SCHEMA_PATH.parent.mkdir(parents=True, exist_ok=True)
REPORT_ROOT.mkdir(parents=True, exist_ok=True)
SNAPSHOT_ROOT.mkdir(parents=True, exist_ok=True)


def _utc_now() -> str:
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


class MasterStore:
    """Simple wrapper around SQLite for TestOps state."""

    def __init__(self) -> None:
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        if not SCHEMA_PATH.exists():
            raise FileNotFoundError(f"Schema file missing at {SCHEMA_PATH}")
        schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
        with self._connect() as conn:
            conn.executescript(schema_sql)
            conn.commit()

    def record_run_start(self, run_id: str, status: str = "RUNNING") -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO test_runs(run_id, status, started_at) VALUES (?, ?, ?)",
                (run_id, status, _utc_now()),
            )
            conn.commit()

    def finalize_run(
        self,
        run_id: str,
        status: str,
        result_path: Path | None = None,
        report_path: Path | None = None,
        bundle_path: Path | None = None,
    ) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE test_runs
                SET status = ?,
                    ended_at = COALESCE(ended_at, ?),
                    result_path = COALESCE(?, result_path),
                    report_path = COALESCE(?, report_path),
                    bundle_path = COALESCE(?, bundle_path)
                WHERE run_id = ?
                """,
                (
                    status,
                    _utc_now(),
                    str(result_path) if result_path else None,
                    str(report_path) if report_path else None,
                    str(bundle_path) if bundle_path else None,
                    run_id,
                ),
            )
            conn.commit()

    def write_result_json(self, run_id: str, payload: Mapping[str, Any]) -> Path:
        run_dir = REPORT_ROOT / run_id
        run_dir.mkdir(parents=True, exist_ok=True)
        result_path = run_dir / "result.json"
        result_path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
        with self._connect() as conn:
            conn.execute(
                "UPDATE test_runs SET result_path = ? WHERE run_id = ?",
                (str(result_path), run_id),
            )
            conn.commit()
        return result_path

    def save_report_paths(self, run_id: str, html_path: Path, json_path: Path, bundle_path: Path | None) -> None:
        with self._connect() as conn:
            conn.execute(
                "UPDATE test_runs SET report_path = ?, bundle_path = COALESCE(?, bundle_path) WHERE run_id = ?",
                (str(html_path), str(bundle_path) if bundle_path else None, run_id),
            )
            conn.commit()

    def save_snapshot(self, run_id: str, snapshot: Mapping[str, Any]) -> Path:
        run_dir = SNAPSHOT_ROOT
        run_dir.mkdir(parents=True, exist_ok=True)
        snapshot_path = run_dir / f"{run_id}.json"
        snapshot_path.write_text(json.dumps(snapshot, indent=2, sort_keys=True), encoding="utf-8")
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO snapshots(run_id, snapshot_json, created_at) VALUES (?, ?, ?)",
                (run_id, json.dumps(snapshot, sort_keys=True), _utc_now()),
            )
            conn.commit()
        return snapshot_path

    def load_snapshot(self, run_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute("SELECT snapshot_json FROM snapshots WHERE run_id = ? ORDER BY created_at DESC LIMIT 1", (run_id,)).fetchone()
        if not row:
            return None
        return json.loads(row["snapshot_json"])

    def record_warroom_event(self, run_id: str, event: Mapping[str, Any]) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO warroom_events(run_id, severity, subsystem, message, suggestion, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    run_id,
                    event.get("severity"),
                    event.get("subsystem"),
                    event.get("message"),
                    event.get("suggestion"),
                    event.get("timestamp", _utc_now()),
                ),
            )
            conn.commit()

    def history(self, limit: int = 25) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT run_id, status, started_at, ended_at, report_path, bundle_path FROM test_runs ORDER BY started_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(row) for row in rows]

    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM test_runs WHERE run_id = ?", (run_id,)).fetchone()
        return dict(row) if row else None


__all__ = ["MasterStore", "DB_PATH", "SCHEMA_PATH", "REPORT_ROOT", "SNAPSHOT_ROOT"]
