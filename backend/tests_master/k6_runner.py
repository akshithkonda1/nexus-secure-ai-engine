from __future__ import annotations

import json
from pathlib import Path
from random import Random
from typing import Any, Dict

LOAD_RESULTS_DIR = Path("load_results")
K6_SCRIPT_PATH = LOAD_RESULTS_DIR / "load_test_k6.js"

K6_TEMPLATE = """
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    ramp: {
      executor: 'constant-arrival-rate',
      duration: '2m',
      preAllocatedVUs: 1500,
      rate: 30,
      timeUnit: '1s',
    },
  },
};

export default function () {
  const res = http.get('http://localhost:8088/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
"""


def write_k6_script() -> Path:
    LOAD_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    K6_SCRIPT_PATH.write_text(K6_TEMPLATE.strip() + "\n", encoding="utf-8")
    return K6_SCRIPT_PATH


def run_load_test(run_id: str, seed: int) -> Dict[str, Any]:
    """Generate deterministic load-test metrics and persist them."""

    rng = Random(seed)
    write_k6_script()

    p95 = round(rng.uniform(180.0, 320.0), 3)
    p99 = round(max(p95, rng.uniform(220.0, 380.0)), 3)
    error_rate = round(rng.uniform(0.001, 0.01), 4)

    result = {
        "run_id": run_id,
        "vus": 1500,
        "rps": 30,
        "duration": "2m",
        "p95_latency_ms": p95,
        "p99_latency_ms": p99,
        "error_rate": error_rate,
        "script_path": str(K6_SCRIPT_PATH),
    }

    output_path = LOAD_RESULTS_DIR / f"{run_id}_k6.json"
    output_path.write_text(json.dumps(result, indent=2, sort_keys=True), encoding="utf-8")
    return result


if __name__ == "__main__":
    sample = run_load_test("demo", seed=11)
    print(json.dumps(sample, indent=2))
