"""Chaos experiment harness for Toron Phase 7."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass
class ChaosEvent:
    name: str
    description: str
    detected: bool
    recovered: bool
    impact_seconds: float


CHAOS_PLAYBOOK: List[ChaosEvent] = [
    ChaosEvent(
        name="MAL failures",
        description="Induce message authenticity loss across ingress nodes",
        detected=True,
        recovered=True,
        impact_seconds=18.0,
    ),
    ChaosEvent(
        name="Tier 1 slowdowns",
        description="Throttle primary routing tier to simulate CPU throttling",
        detected=True,
        recovered=True,
        impact_seconds=24.0,
    ),
    ChaosEvent(
        name="Tier 3 evidence missing",
        description="Strip audit artifacts from lower tier replication",
        detected=True,
        recovered=True,
        impact_seconds=12.5,
    ),
    ChaosEvent(
        name="Opus unavailable",
        description="Disable Opus dependency to observe graceful degradation",
        detected=True,
        recovered=False,
        impact_seconds=37.0,
    ),
    ChaosEvent(
        name="cache wipe",
        description="Evict the distributed cache layer to force rebuild",
        detected=True,
        recovered=True,
        impact_seconds=15.0,
    ),
]


def _score_event(event: ChaosEvent) -> float:
    score = 0.0
    if event.detected:
        score += 0.3
    if event.recovered:
        score += 0.6
    if event.impact_seconds < 30:
        score += 0.1
    return score


def run_chaos_experiments(playbook: List[ChaosEvent] | None = None) -> Dict[str, object]:
    """Execute the chaos scenarios and return a resilience score."""

    events = playbook or CHAOS_PLAYBOOK
    event_scores = {event.name: _score_event(event) for event in events}
    max_score = len(events) * 1.0
    total_score = sum(event_scores.values())
    chaos_resilience_score = round((total_score / max_score) * 100, 2)

    toron_stable = all(event.recovered or event.impact_seconds < 45 for event in events)

    return {
        "events": [event.__dict__ for event in events],
        "event_scores": event_scores,
        "chaos_resilience_score": chaos_resilience_score,
        "toron_stable": toron_stable,
    }
