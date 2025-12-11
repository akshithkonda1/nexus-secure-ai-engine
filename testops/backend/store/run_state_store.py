"""SQLite-backed run state store."""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Iterator, Optional

from testops.backend.models.run_state import RunState

DB_PATH = Path(__file__).resolve().parent.parent / "db" / "run_state.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


class RunStateStore:
    """Persist run states into SQLite."""

    def __init__(self, db_path: Path = DB_PATH) -> None:
        self.db_path = db_path
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS run_state (
                    run_id TEXT PRIMARY KEY,
                    status TEXT,
                    phase TEXT,
                    progress INTEGER,
                    started_at TEXT,
                    updated_at TEXT
                );
                """
            )
            conn.commit()

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
        finally:
            conn.close()

    def save(self, run_state: RunState) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO run_state (run_id, status, phase, progress, started_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    run_state.run_id,
                    run_state.status,
                    run_state.phase,
                    run_state.progress,
                    run_state.started_at.isoformat(),
                    run_state.updated_at.isoformat(),
                ),
            )
            conn.commit()

    def get(self, run_id: str) -> Optional[RunState]:
        with self._connect() as conn:
            cursor = conn.execute(
                "SELECT run_id, status, phase, progress, started_at, updated_at FROM run_state WHERE run_id = ?",
                (run_id,),
            )
            row = cursor.fetchone()
            if not row:
                return None
            return RunState(
                run_id=row[0],
                status=row[1],
                phase=row[2],
                progress=row[3],
                started_at=datetime.fromisoformat(row[4]),
                updated_at=datetime.fromisoformat(row[5]),
            )

    def update_fields(self, run_id: str, **fields: object) -> Optional[RunState]:
        existing = self.get(run_id)
        if not existing:
            return None
        updated_data = existing.model_dump()
        updated_data.update(fields)
        updated_state = RunState(**updated_data)
        self.save(updated_state)
        return updated_state


store = RunStateStore()

__all__ = ["RunStateStore", "store"]
