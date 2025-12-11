import json
from datetime import datetime
from pathlib import Path
from typing import Dict

from testops_backend.core.config import WARROOM_DIR

WARROOM_LOG = WARROOM_DIR / "warroom.log"


def log_anomaly(kind: str, message: str, metadata: Dict | None = None) -> Path:
    WARROOM_DIR.mkdir(parents=True, exist_ok=True)
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "kind": kind,
        "message": message,
        "metadata": metadata or {},
    }
    with WARROOM_LOG.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry) + "\n")
    return WARROOM_LOG
