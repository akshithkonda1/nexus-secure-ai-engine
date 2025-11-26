"""Logging helper for micro-agent operations."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

LOG_PATH = Path("/workspace_history/operations.log")


def log_operation(session_id: str, plan_id: str, user_id: str | None, details: Dict[str, Any]) -> None:
    """Append a structured log entry for auditability."""

    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "session_id": session_id,
        "plan_id": plan_id,
        "user_id": user_id,
        "details": details,
    }
    with LOG_PATH.open("a", encoding="utf-8") as log_file:
        log_file.write(json.dumps(entry) + "\n")

