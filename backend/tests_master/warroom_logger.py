"""Centralized WAR ROOM logging for master test suite."""
from __future__ import annotations

import traceback
from datetime import datetime
from pathlib import Path
from typing import Optional

from .master_store import WARROOM_DIR


def log_error(run_id: str, tier: str, error: Exception, context: Optional[str] = None) -> Path:
    """Write an error entry to the WAR ROOM log file."""

    WARROOM_DIR.mkdir(parents=True, exist_ok=True)
    log_path = WARROOM_DIR / f"{run_id}_errors.log"
    timestamp = datetime.utcnow().isoformat()
    stack = "".join(traceback.format_exception(type(error), error, error.__traceback__))
    entry = f"[{timestamp}] [tier={tier}] {context or ''} {error}\n{stack}\n"
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(entry)
    return log_path


__all__ = ["log_error"]
