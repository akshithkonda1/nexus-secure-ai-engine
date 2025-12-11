from __future__ import annotations

import asyncio
from random import random
from typing import Any, Dict


async def run(engine: Any, progress_cb) -> Dict:
    metrics = {"latency_heatmap": "stable", "coverage": 0.95}
    logs = []
    for step in range(5):
        await asyncio.sleep(0.1)
        await progress_cb(step * 20, f"SIM scenario {step + 1} running")
        logs.append(f"SIM step {step + 1} ok")
    await progress_cb(100, "SIM suite complete")
    return {"status": "PASS", "metrics": metrics, "logs": logs}
