"""Region-aware bucketing for rate limits."""
from __future__ import annotations

from typing import Dict


REGION_LIMITS: Dict[str, int] = {
    "us-east": 100,
    "us-west": 100,
    "eu-central": 80,
    "ap-southeast": 60,
}


def get_limit_for_region(region: str) -> int:
    return REGION_LIMITS.get(region, 50)
