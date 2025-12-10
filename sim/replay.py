"""Replay utilities for Toron v2.5H+ simulation snapshots."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Iterable, List

from ryuzen.toron_v25hplus.engine import StateSnapshot


class SimulationReplay:
    """Persist and replay simulation snapshots for deterministic audit."""

    def __init__(self, replay_path: str | Path = "sim/replays.jsonl") -> None:
        self.replay_path = Path(replay_path)
        self.replay_path.parent.mkdir(parents=True, exist_ok=True)

    def persist(self, snapshots: Iterable[StateSnapshot]) -> None:
        with self.replay_path.open("w", encoding="utf-8") as handle:
            for snapshot in snapshots:
                handle.write(json.dumps(snapshot.as_dict()) + "\n")

    def load(self) -> List[Dict[str, object]]:
        if not self.replay_path.exists():
            return []
        with self.replay_path.open("r", encoding="utf-8") as handle:
            return [json.loads(line) for line in handle if line.strip()]
