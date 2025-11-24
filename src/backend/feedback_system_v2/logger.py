"""Local storage logger for development environments."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


STORAGE_DIR = Path(__file__).resolve().parent / "storage" / "feedback"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def write_local(record_id: str, payload: Dict[str, Any]) -> Path:
    path = STORAGE_DIR / f"{record_id}.json"
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    return path
