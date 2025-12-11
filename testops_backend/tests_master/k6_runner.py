import asyncio
import hashlib
import json
from pathlib import Path
from typing import Dict
from testops_backend.core.config import LOAD_DIR, LOAD_MAX_VUS, REPORT_DIR
from testops_backend.core.logger import get_logger
from testops_backend.load.k6_generator import generate_k6_script

logger = get_logger("k6_runner")


class K6Runner:
    async def run_load_test(self, run_id: str) -> Dict[str, float]:
        script_path = LOAD_DIR / f"{run_id}_k6.js"
        script_content = generate_k6_script(target=LOAD_MAX_VUS)
        script_path.write_text(script_content, encoding="utf-8")

        await asyncio.sleep(0.1)
        seed = int(hashlib.sha256(run_id.encode()).hexdigest(), 16) % 10_000
        p95 = 120 + (seed % 15)
        p99 = 180 + (seed % 20)
        throughput = 5000 + (seed % 300)
        failure_rate = 0.002 + ((seed % 10) / 10000)
        metrics = {
            "p95": float(p95),
            "p99": float(p99),
            "throughput": float(throughput),
            "failure_rate": float(failure_rate),
        }
        logger.info("Load test simulated for %s with metrics %s", run_id, metrics)
        report_copy = REPORT_DIR / f"{run_id}_k6.json"
        report_copy.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
        return metrics
