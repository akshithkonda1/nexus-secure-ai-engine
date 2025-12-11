import json
import shutil
import subprocess
from typing import Dict

from testops_backend.core.config import LOAD_DIR
from .k6_generator import K6Profile, build_profile, generate_k6_script
from .k6_parser import parse_summary


def _synthetic_results(profile: K6Profile) -> Dict[str, float]:
    """Offline fallback when k6 is unavailable."""

    req_per_sec = float(profile.rps)
    p95 = 180.0 if profile.extended else 120.0
    p99 = 220.0 if profile.extended else 150.0
    failure_rate = 0.015 if profile.extended else 0.005
    return {
        "p95": p95,
        "p99": p99,
        "req_per_sec": req_per_sec,
        "failure_rate": failure_rate,
        "vus": float(profile.vus),
        "duration_seconds": 120.0,
    }


def run_k6(profile: K6Profile | None = None, endpoint: str = "http://localhost:8000/health") -> Dict:
    profile = profile or build_profile()
    script_path = generate_k6_script(profile, endpoint=endpoint)
    summary_path = LOAD_DIR / ("k6_summary_stress.json" if profile.extended else "k6_summary.json")

    if not shutil.which("k6"):
        return {"mode": "synthetic", "metrics": _synthetic_results(profile), "summary_path": str(summary_path)}

    command = ["k6", "run", "--summary-export", str(summary_path), str(script_path)]
    try:
        subprocess.run(command, check=True, capture_output=True)
    except subprocess.CalledProcessError as exc:
        return {"mode": "failed", "error": exc.stderr.decode(), "summary_path": str(summary_path)}

    if summary_path.exists():
        metrics = parse_summary(json.loads(summary_path.read_text(encoding="utf-8")))
        return {"mode": "executed", "metrics": metrics, "summary_path": str(summary_path)}

    return {"mode": "unknown", "summary_path": str(summary_path)}
