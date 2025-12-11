"""Structured incident logging for TestOps master runs."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Dict


class WarRoomLogger:
    """Writes subsystem warnings/errors to per-run log files."""

    def __init__(self, base_dir: Path) -> None:
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def log(self, run_id: str, severity: str, subsystem: str, message: str, suggestion: str) -> Dict[str, str]:
        timestamp = datetime.utcnow().isoformat() + "Z"
        entry = {
            "timestamp": timestamp,
            "severity": severity,
            "subsystem": subsystem,
            "message": message,
            "suggestion": suggestion,
        }
        run_dir = self.base_dir / "master"
        run_dir.mkdir(parents=True, exist_ok=True)
        log_path = run_dir / f"{run_id}.log"
        with log_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(entry) + "\n")
        return entry


__all__ = ["WarRoomLogger"]
