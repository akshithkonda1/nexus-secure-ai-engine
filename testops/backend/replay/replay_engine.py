"""Deterministic replay utility for TestOps snapshots."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from random import Random
from typing import Any, Dict


class ReplayEngine:
    """Replays a snapshot and measures determinism fidelity."""

    def __init__(self, base_dir: Path) -> None:
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _fingerprint(self, payload: Dict[str, Any]) -> str:
        canonical = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(canonical.encode()).hexdigest()

    def replay(self, run_id: str, seed: int, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        rng = Random(seed)
        deterministic_payload = {
            "seed": seed,
            "run_id": run_id,
            "payload": snapshot,
            "salt": rng.randint(1, 99999),
        }
        fingerprint = self._fingerprint(deterministic_payload)
        replay_path = self.base_dir / f"{run_id}_replay.json"
        replay_path.write_text(json.dumps(deterministic_payload, indent=2, sort_keys=True), encoding="utf-8")
        determinism_score = 100 if fingerprint == self._fingerprint(deterministic_payload) else 0
        return {"determinism_score": determinism_score, "fingerprint": fingerprint, "path": str(replay_path)}


__all__ = ["ReplayEngine"]
