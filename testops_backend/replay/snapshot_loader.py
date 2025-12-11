import json
from pathlib import Path
from typing import Dict, Optional

from testops_backend.core.config import SNAPSHOT_DIR


def load_snapshot(run_id: str) -> Optional[Dict]:
    path = SNAPSHOT_DIR / f"{run_id}_snapshot.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))
