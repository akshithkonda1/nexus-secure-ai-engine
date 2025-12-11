from pathlib import Path
import threading
from datetime import datetime


class WarRoomLogger:
    _lock = threading.Lock()

    def __init__(self, base_dir="warroom/master"):
        self.base = Path(base_dir)
        self.base.mkdir(parents=True, exist_ok=True)

    def log(self, run_id: str, message: str):
        with self._lock:
            ts = datetime.utcnow().isoformat() + "Z"
            path = self.base / f"{run_id}.log"
            with open(path, "a", encoding="utf-8") as f:
                f.write(f"[{ts}] {message}\n")


# global instance (import-safe)
_logger = WarRoomLogger()


def log_error(run_id: str, message: str):
    _logger.log(run_id, f"ERROR: {message}")
