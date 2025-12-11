import asyncio
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List
from testops_backend.core.config import SIM_DIR, SNAPSHOT_DIR
from testops_backend.core.logger import get_logger
from testops_backend.sim.sim_assertions import evaluate_result

logger = get_logger("sim_runner")


@dataclass
class SimResult:
    metrics: Dict[str, float]
    notes: List[str]
    artifacts: Dict[str, str]


class SimRunner:
    async def run_batch(self, run_id: str, users: int) -> SimResult:
        dataset_path = SIM_DIR / "sim_dataset.json"
        with open(dataset_path, "r", encoding="utf-8") as f:
            dataset = json.load(f)
        hashed = int(hashlib.sha256(run_id.encode()).hexdigest(), 16)
        scale = min(users, 10_000)
        await asyncio.sleep(0.05)
        metrics, notes = evaluate_result(dataset, scale, hashed)
        snapshot_path = SNAPSHOT_DIR / f"{run_id}_snapshot.json"
        snapshot_path.write_text(json.dumps({"dataset_hash": hashed, "scale": scale}), encoding="utf-8")
        artifacts = {"snapshot": str(snapshot_path)}
        logger.info("SIM batch completed for %s", run_id)
        return SimResult(metrics=metrics, notes=notes, artifacts=artifacts)
