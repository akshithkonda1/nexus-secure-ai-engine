"""Simulated k6 load test executor."""
from __future__ import annotations

import time
from pathlib import Path
from random import Random
from typing import Any, Dict


class K6Runner:
    """Generates a deterministic k6 script and simulates execution results."""

    def __init__(self, work_dir: Path) -> None:
        self.work_dir = work_dir
        self.work_dir.mkdir(parents=True, exist_ok=True)

    def _write_script(self, run_id: str) -> Path:
        script = """
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1500,
  rps: 30,
  duration: '2m',
};

export default function () {
  http.get('http://localhost:8000/health');
  sleep(1);
}
"""
        script_path = self.work_dir / f"{run_id}_loadtest.js"
        script_path.write_text(script.strip() + "\n", encoding="utf-8")
        return script_path

    def run(self, run_id: str, rng: Random) -> Dict[str, Any]:
        script_path = self._write_script(run_id)
        start = time.perf_counter()
        # Simulated metrics derived from deterministic randomness
        http_failures = int(rng.random() * 3)
        reqs = 30 * 120
        p95 = round(250 + rng.random() * 15, 2)
        p99 = round(320 + rng.random() * 20, 2)
        duration_ms = int((time.perf_counter() - start) * 1000)
        summary = {
            "script": str(script_path),
            "vus": 1500,
            "rps": 30,
            "duration": "2m",
            "http_failures": http_failures,
            "requests_sent": reqs,
            "latency_p95_ms": p95,
            "latency_p99_ms": p99,
            "execution_ms": duration_ms,
        }
        return summary


__all__ = ["K6Runner"]
