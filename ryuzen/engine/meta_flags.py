"""Meta-surveillance flag normalization utilities."""
from __future__ import annotations

from typing import List


def stabilized_meta_flags(opus_used: bool) -> List[str]:
    """Emit only the minimal set of meta flags."""

    meta_flags: List[str] = []
    if opus_used:
        meta_flags.append("opus_escalation")

    return meta_flags


__all__ = ["stabilized_meta_flags"]
