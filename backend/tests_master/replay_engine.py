from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Dict

SNAPSHOT_DIR = Path("snapshots")


def replay_snapshot(run_id: str, snapshot_path: Path | str) -> Dict[str, Any]:
    path = Path(snapshot_path)
    if not path.exists():
        return {
            "run_id": run_id,
            "matched": False,
            "error": f"Snapshot missing at {path}",
        }

    content = path.read_bytes()
    sha = hashlib.sha256(content).hexdigest()
    try:
        parsed = json.loads(content.decode("utf-8"))
    except Exception:
        parsed = {}

    sorted_bytes = json.dumps(parsed, sort_keys=True, indent=2).encode("utf-8")
    replay_hash = hashlib.sha256(sorted_bytes).hexdigest()
    byte_match = content == sorted_bytes

    return {
        "run_id": run_id,
        "matched": byte_match,
        "snapshot_path": str(path),
        "sha256_bytes": sha,
        "sha256_sorted": replay_hash,
        "records": len(parsed) if isinstance(parsed, list) else len(parsed.keys()) if isinstance(parsed, dict) else 0,
    }


if __name__ == "__main__":
    demo_path = SNAPSHOT_DIR / "state_snapshot.json"
    if demo_path.exists():
        print(json.dumps(replay_snapshot("demo", demo_path), indent=2))
    else:
        print("No snapshot to replay.")
