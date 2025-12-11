"""WAR ROOM logger with severity scoring and subsystem mapping."""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Mapping, Optional

from testops.backend.runners.master_store import MasterStore


SEVERITY_SCORES = {
    "CRITICAL": 100,
    "HIGH": 75,
    "MEDIUM": 40,
    "LOW": 10,
}


    def __init__(self, base_dir: Path) -> None:
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def __init__(self, store: Optional[MasterStore] = None) -> None:
        self.path = WARROOM_LOG
        self.store = store

    def _now(self) -> str:
        return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    def _score(self, severity: str) -> int:
        return SEVERITY_SCORES.get(severity.upper(), 0)

    def log_event(
        self,
        run_id: str,
        subsystem: str,
        severity: str,
        message: str,
        suggestion: str,
    ) -> Dict[str, Any]:
        payload = {
            "run_id": run_id,
            "timestamp": self._now(),
            "severity": severity.upper(),
            "subsystem": subsystem,
            "message": message,
            "suggestion": suggestion,
            "score": self._score(severity),
        }
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload) + "\n")
        if self.store:
            self.store.record_warroom_event(run_id, payload)
        return payload


__all__ = ["WarroomLogger", "SEVERITY_SCORES", "WARROOM_LOG"]
