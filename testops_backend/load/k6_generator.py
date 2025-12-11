"""Generate deterministic k6 load-test scripts."""
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from testops_backend.core.config import LOAD_DIR


@dataclass
class K6Profile:
    vus: int
    rps: int
    duration: str
    extended: bool = False


BASELINE_VUS = 1500
STRESS_VUS = 10_000
BASELINE_RPS = 30
BASELINE_DURATION = "2m"


def build_profile(mode: Literal["baseline", "stress"] = "baseline") -> K6Profile:
    if mode == "stress":
        return K6Profile(vus=STRESS_VUS, rps=BASELINE_RPS, duration=BASELINE_DURATION, extended=True)
    return K6Profile(vus=BASELINE_VUS, rps=BASELINE_RPS, duration=BASELINE_DURATION)


def generate_k6_script(profile: K6Profile, endpoint: str = "http://localhost:8000/health") -> Path:
    """Render a k6 script based on the provided profile."""

    script = f"""
import http from 'k6/http';
import {{ check }} from 'k6';

export const options = {{
  scenarios: {{
    toron_load: {{
      executor: 'constant-arrival-rate',
      rate: {profile.rps},
      timeUnit: '1s',
      duration: '{profile.duration}',
      preAllocatedVUs: {profile.vus},
      maxVUs: {profile.vus},
    }},
  }},
}};

export default function () {{
  const res = http.get('{endpoint}');
  check(res, {{ 'status was 200': (r) => r.status === 200 }});
}}
"""
    LOAD_DIR.mkdir(parents=True, exist_ok=True)
    script_path = LOAD_DIR / ("k6_script_stress.js" if profile.extended else "k6_script.js")
    script_path.write_text(script, encoding="utf-8")
    return script_path
