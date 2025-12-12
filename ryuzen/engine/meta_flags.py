"""Meta-surveillance flag normalization utilities."""
from __future__ import annotations

from typing import List

def stabilized_meta_flags(contradiction_count: int, latency_ms: int, missing_evidence: bool) -> List[str]:
    """Emit only meaningful meta flags to avoid noisy signals."""

    flags: List[str] = []

    if contradiction_count > 0:
        flags.append("contradiction")

    if latency_ms > 460:
        flags.append("high_latency")

    if missing_evidence:
        flags.append("missing_evidence")

    return flags


__all__ = ["stabilized_meta_flags"]
