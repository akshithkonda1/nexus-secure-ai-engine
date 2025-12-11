import json
from pathlib import Path
from typing import Dict
from testops_backend.core.config import SNAPSHOT_DIR


def save_snapshot(run_id: str, payload: Dict) -> Path:
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    path = SNAPSHOT_DIR / f"{run_id}_snapshot.json"
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return path


def replay_snapshot(run_id: str) -> dict:
    path = SNAPSHOT_DIR / f"{run_id}_snapshot.json"
    if not path.exists():
        return {"ok": False, "message": "snapshot missing"}
    payload = json.loads(path.read_text(encoding="utf-8"))
    return {"ok": True, "payload": payload}
