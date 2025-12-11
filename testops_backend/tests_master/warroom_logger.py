from datetime import datetime
from pathlib import Path
from testops_backend.core.config import WARROOM_DIR


def append_warroom(run_id: str, message: str) -> str:
    WARROOM_DIR.mkdir(parents=True, exist_ok=True)
    path = WARROOM_DIR / f"{run_id}.log"
    timestamp = datetime.utcnow().isoformat()
    with open(path, "a", encoding="utf-8") as f:
        f.write(f"{timestamp} {message}\n")
    return str(path)
