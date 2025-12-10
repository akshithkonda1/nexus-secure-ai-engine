from __future__ import annotations

import json
import zipfile
from pathlib import Path
from typing import Any, Dict

SNAPSHOT_DIR = Path("snapshots")


def save_snapshot(run_id: str, payload: Dict[str, Any]) -> Dict[str, str]:
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    snapshot_path = SNAPSHOT_DIR / "state_snapshot.json"
    bundle_path = SNAPSHOT_DIR / "bundle.zip"

    snapshot_path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
    with zipfile.ZipFile(bundle_path, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        bundle.write(snapshot_path, arcname="state_snapshot.json")
    return {"snapshot_path": str(snapshot_path), "bundle_path": str(bundle_path)}


if __name__ == "__main__":
    print(save_snapshot("demo", {"status": "ok"}))
