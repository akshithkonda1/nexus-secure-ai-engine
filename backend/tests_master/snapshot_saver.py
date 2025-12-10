from __future__ import annotations

import json
import zipfile
from pathlib import Path
from typing import Dict, Tuple

from .master_store import SNAPSHOT_DIR

SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)


def save_snapshot(run_id: str, state: Dict[str, object]) -> Tuple[str, str]:
    snapshot_path = SNAPSHOT_DIR / "state_snapshot.json"
    snapshot_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

    bundle_path = SNAPSHOT_DIR / f"{run_id}_bundle.zip"
    with zipfile.ZipFile(bundle_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("state_snapshot.json", snapshot_path.read_text(encoding="utf-8"))
    return str(snapshot_path), str(bundle_path)


__all__ = ["save_snapshot"]
