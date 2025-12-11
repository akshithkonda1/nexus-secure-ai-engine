import json
from pathlib import Path
from typing import Dict
from testops_backend.core.config import REPORT_DIR


def write_sim_report(run_id: str, metrics: Dict[str, float]) -> str:
    path = REPORT_DIR / f"{run_id}_sim.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"metrics": metrics}, f, indent=2)
    return str(path)
