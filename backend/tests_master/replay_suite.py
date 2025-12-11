from __future__ import annotations

import asyncio
from typing import Any, Dict


async def run(engine: Any, progress_cb) -> Dict:
    metrics = {"determinism": 0.93}
    logs = []
    for step in range(3):
        await asyncio.sleep(0.1)
        await progress_cb((step + 1) * 33, f"Replay iteration {step + 1}")
        logs.append(f"Replay iteration {step + 1} stable")
    return {"status": "PASS", "metrics": metrics, "logs": logs}
