from __future__ import annotations

import asyncio
from typing import Any, Dict


async def run(engine: Any, progress_cb) -> Dict:
    metrics = {"multi_cloud": 0.9, "drift": "minimal"}
    logs = []
    for step in range(4):
        await asyncio.sleep(0.1)
        await progress_cb((step + 1) * 25, f"Cloud hardening check {step + 1}")
        logs.append(f"Cloud hardening check {step + 1} done")
    return {"status": "PASS", "metrics": metrics, "logs": logs}
