"""Utilities for persisting deterministic TestOps snapshots."""
import json
from pathlib import Path
from typing import Any, Dict, List


class SnapshotStore:
    """File-based snapshot persistence helper."""

    def __init__(self, base_dir: Path) -> None:
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, run_id: str, label: str) -> Path:
        filename = f"{run_id}_{label}.json"
        return self.base_dir / filename

    def save(self, run_id: str, label: str, payload: Dict[str, Any]) -> Path:
        path = self._path(run_id, label)
        with path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2, sort_keys=True)
        return path

    def bundle(self, run_id: str) -> List[Path]:
        if not self.base_dir.exists():
            return []
        return sorted(self.base_dir.glob(f"{run_id}_*.json"))
