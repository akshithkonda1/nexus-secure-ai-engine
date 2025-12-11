"""Generate k6 load test scripts for Toron simulation endpoints."""
from __future__ import annotations

from pathlib import Path
from typing import Optional


def generate_k6_script(target_url: str) -> str:
    """Return a k6 script configured for 1500 VUs, 30 RPS, 2 minutes."""
    return f"""
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {{
  scenarios: {{
    toron_load: {{
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 1500,
      maxVUs: 1500,
    }},
  }},
}};

export default function () {{
  const response = http.get('{target_url}');
  sleep(0.5);
}}
"""


def save_k6_script(target_url: str, destination: Optional[Path] = None) -> Path:
    """Write the generated script to disk and return its path."""
    destination = destination or Path("k6_toron.js")
    destination.write_text(generate_k6_script(target_url), encoding="utf-8")
    return destination


__all__ = ["generate_k6_script", "save_k6_script"]
