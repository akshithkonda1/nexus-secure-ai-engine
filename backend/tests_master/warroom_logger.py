import os
from datetime import datetime


class WarRoomLogger:
    LOG_DIR = "warroom/master"

    def __init__(self):
        os.makedirs(self.LOG_DIR, exist_ok=True)

    def log(self, run_id: str, message: str):
        ts = datetime.utcnow().isoformat()
        log_line = f"[{ts}] {message}\n"

        with open(f"{self.LOG_DIR}/{run_id}.log", "a") as f:
            f.write(log_line)
