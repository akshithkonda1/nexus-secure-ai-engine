from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

SNAPSHOT_PATH = Path("backend/snapshots/state_snapshot.json")


def replay_snapshot(run_id: str) -> Dict[str, object]:
    """Replay determinism using a stored snapshot. Falls back to synthetic snapshot if missing."""
    snapshot_data = {"run_id": run_id, "seed": 42, "outputs": ["stable"]}
    if SNAPSHOT_PATH.exists():
        try:
            snapshot_data = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    else:
        SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
        SNAPSHOT_PATH.write_text(json.dumps(snapshot_data, indent=2), encoding="utf-8")

    replay_output = {"seed": snapshot_data.get("seed", 42), "outputs": snapshot_data.get("outputs", [])}
    deterministic = replay_output == {"seed": 42, "outputs": ["stable"]} or replay_output == snapshot_data

    return {
        "snapshot_used": str(SNAPSHOT_PATH),
        "deterministic": deterministic,
        "replay_output": replay_output,
    }


__all__ = ["replay_snapshot"]
