"""Utility for writing structured logs per run."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)


def write_log(run_id: str, message: str) -> Path:
    """Append a timestamped log entry for the given run ID."""
    timestamp = datetime.now(timezone.utc).isoformat()
    log_path = LOG_DIR / f"{run_id}.log"
    with log_path.open("a", encoding="utf-8") as log_file:
        log_file.write(f"{timestamp} | {message}\n")
    return log_path


__all__ = ["write_log", "LOG_DIR"]
