"""Warroom logger for Section 2 error capture."""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Dict

BASE_DIR = Path(__file__).resolve().parents[1]
WARROOM_DIR = BASE_DIR / "warroom"
WARROOM_DIR.mkdir(parents=True, exist_ok=True)
WARROOM_LOG = WARROOM_DIR / "warroom.log"


class WarroomLogger:
    """Persists structured incident logs for post-run triage."""

    def __init__(self) -> None:
        self.path = WARROOM_LOG

    def log_error(self, subsystem: str, severity: str, message: str, suggestion: str) -> Dict[str, str]:
        payload = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "severity": severity,
            "subsystem": subsystem,
            "message": message,
            "suggestion": suggestion,
        }
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload) + "\n")
        return payload


__all__ = ["WarroomLogger"]
