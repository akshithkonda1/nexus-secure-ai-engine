import json
from pathlib import Path
from testops_backend.core.config import SNAPSHOT_DIR


def replay_snapshot(run_id: str) -> dict:
    path = SNAPSHOT_DIR / f"{run_id}_snapshot.json"
    if not path.exists():
        return {"ok": False, "message": "snapshot missing"}
    payload = json.loads(path.read_text(encoding="utf-8"))
    return {"ok": True, "payload": payload}
