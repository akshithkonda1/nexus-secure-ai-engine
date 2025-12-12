"""Utilities to smooth contradiction detection noise."""
from __future__ import annotations

from typing import Iterable


class _PolarityRecord:
    def __init__(self, subject: str, polarity: bool) -> None:
        self.subject = subject
        self.polarity = polarity


def stabilized_contradiction_score(facts: Iterable[_PolarityRecord], conclusions: Iterable[_PolarityRecord]) -> int:
    """
    Remove synthetic contradictions that arise from randomness.

    Only flags contradictions supported by actual logical disagreement and
    caps the count to keep Toron stable across repeated runs.
    """

    facts = list(facts or [])
    conclusions = list(conclusions or [])
    if not facts or not conclusions:
        return 0

    real_conflicts = 0

    for fact in facts:
        for conclusion in conclusions:
            if fact.subject == conclusion.subject and fact.polarity != conclusion.polarity:
                real_conflicts += 1

    return min(real_conflicts, 2)


__all__ = ["stabilized_contradiction_score", "_PolarityRecord"]
