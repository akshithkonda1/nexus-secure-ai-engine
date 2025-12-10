from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

BASE_DIR = Path("backend")
LOG_DIR = BASE_DIR / "logs" / "master"
LOAD_RESULTS_DIR = BASE_DIR / "load_results"
REPORT_DIR = BASE_DIR / "reports" / "master"
SNAPSHOT_DIR = BASE_DIR / "snapshots"

for directory in (LOG_DIR, LOAD_RESULTS_DIR, REPORT_DIR, SNAPSHOT_DIR):
    directory.mkdir(parents=True, exist_ok=True)


class MasterStore:
    def __init__(self):
        self.state: Dict[str, Dict[str, Any]] = {}

    def _path(self, run_id: str) -> Path:
        return LOG_DIR / f"{run_id}.json"

    def create_run(self, run_id: str):
        now = datetime.utcnow().isoformat()
        payload = {
            "run_id": run_id,
            "status": "started",
            "progress": 0,
            "steps": {},
            "metrics": {},
            "created_at": now,
            "updated_at": now,
        }
        self.state[run_id] = payload
        self._write(run_id)

    def update_status(self, run_id: str, status: str, progress: Optional[float] = None, steps: Optional[Dict[str, str]] = None):
        data = self._load(run_id)
        data["status"] = status
        if progress is not None:
            data["progress"] = progress
        if steps:
            data.setdefault("steps", {}).update(steps)
        data["updated_at"] = datetime.utcnow().isoformat()
        self.state[run_id] = data
        self._write(run_id)

    def attach_metrics(self, run_id: str, metrics: Dict[str, Any]):
        data = self._load(run_id)
        data.setdefault("metrics", {}).update(metrics)
        data["updated_at"] = datetime.utcnow().isoformat()
        self.state[run_id] = data
        self._write(run_id)

    def attach_artifacts(self, run_id: str, **artifacts: str):
        data = self._load(run_id)
        data.update({k: v for k, v in artifacts.items() if v})
        data["updated_at"] = datetime.utcnow().isoformat()
        self.state[run_id] = data
        self._write(run_id)

    def save_result(self, run_id: str, result: Dict[str, Any]):
        data = self._load(run_id)
        data["result"] = result
        data["updated_at"] = datetime.utcnow().isoformat()
        self.state[run_id] = data
        self._write(run_id)

    def get_status(self, run_id: str) -> Optional[Dict[str, Any]]:
        return self._load(run_id)

    def _load(self, run_id: str) -> Dict[str, Any]:
        if run_id in self.state:
            return dict(self.state[run_id])
        path = self._path(run_id)
        if path.exists():
            with path.open("r", encoding="utf-8") as handle:
                data = json.load(handle)
                self.state[run_id] = data
                return dict(data)
        return {}

    def _write(self, run_id: str):
        path = self._path(run_id)
        with path.open("w", encoding="utf-8") as handle:
            json.dump(self.state[run_id], handle, indent=2)


__all__ = ["MasterStore", "LOG_DIR", "LOAD_RESULTS_DIR", "REPORT_DIR", "SNAPSHOT_DIR"]
