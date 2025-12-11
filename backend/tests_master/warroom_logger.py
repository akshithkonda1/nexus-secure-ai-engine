from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Literal

WARROOM_DIR = Path("backend/warroom/master")
WARROOM_DIR.mkdir(parents=True, exist_ok=True)
INDEX_PATH = WARROOM_DIR / "index.json"


class WarRoomLogger:
    def __init__(self):
        self.index = {"errors": []}
        if INDEX_PATH.exists():
            try:
                self.index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                self.index = {"errors": []}

    def log(self, run_id: str, message: str, severity: Literal["info", "warning", "high", "critical"] = "info"):
        ts = datetime.utcnow().isoformat()
        line = f"[{ts}] [{severity.upper()}] {message}\n"
        log_path = WARROOM_DIR / f"{run_id}.log"
        with log_path.open("a", encoding="utf-8") as handle:
            handle.write(line)

        entry = {"run_id": run_id, "timestamp": ts, "severity": severity, "message": message}
        self.index.setdefault("errors", []).append(entry)
        order = {"critical": 0, "high": 1, "warning": 2, "info": 3}
        self.index["errors"] = sorted(
            self.index.get("errors", []),
            key=lambda e: (order.get(e.get("severity", "info"), 4), e.get("timestamp", "")),
        )
        INDEX_PATH.write_text(json.dumps(self.index, indent=2), encoding="utf-8")


__all__ = ["WarRoomLogger", "WARROOM_DIR"]
