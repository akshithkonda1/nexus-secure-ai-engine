import os
from datetime import datetime
from typing import Optional

from .master_store import MasterStore


class WarRoomLogger:
    LOG_DIR = "warroom/master"

    def __init__(self, store: Optional[MasterStore] = None):
        os.makedirs(self.LOG_DIR, exist_ok=True)
        self.store = store

    def log(self, run_id: str, message: str, severity: str = "INFO") -> None:
        ts = datetime.utcnow().isoformat()
        log_line = f"[{ts}] [{severity}] {message}\n"
        with open(f"{self.LOG_DIR}/{run_id}.log", "a", encoding="utf-8") as handle:
            handle.write(log_line)
        if self.store:
            self.store.record_warroom(run_id, severity, message, timestamp=ts)
