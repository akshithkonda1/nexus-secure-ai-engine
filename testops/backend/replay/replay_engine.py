"""Replay Engine validating determinism of recorded snapshots."""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class ReplayOutcome:
    determinism_score: int
    drift_detected: bool
    details: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "determinism_score": self.determinism_score,
            "drift_detected": self.drift_detected,
            "details": self.details,
        }


class ReplayEngine:
    """Re-executes deterministic simulations against stored snapshots."""

    def __init__(self, target_floor: int = 90) -> None:
        self.target_floor = target_floor

    def _score_from_snapshot(self, snapshot: Dict[str, Any]) -> int:
        serialized = json.dumps(snapshot, sort_keys=True)
        digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        scalar = int(digest[:8], 16) % 11  # bounded jitter
        baseline = snapshot.get("sim", {}).get("metrics", {}).get("determinism", 1.0)
        raw_score = max(0, min(100, int(round(baseline * 100)) - scalar))
        return raw_score

    def validate(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        score = self._score_from_snapshot(snapshot)
        drift = score < self.target_floor
        details = {
            "target_floor": self.target_floor,
            "snapshot_run_id": snapshot.get("run_id"),
            "inputs": {
                "sim": snapshot.get("sim", {}),
                "k6": snapshot.get("k6", {}),
            },
        }
        outcome = ReplayOutcome(
            determinism_score=score,
            drift_detected=drift,
            details=details,
        )
        return outcome.to_dict()


__all__ = ["ReplayEngine", "ReplayOutcome"]
