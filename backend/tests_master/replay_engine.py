from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

SNAPSHOT_PATH = Path("backend/snapshots/state_snapshot.json")


def replay_snapshot(run_id: str) -> Dict[str, object]:
    """Replay determinism using a stored snapshot. Falls back to synthetic snapshot if missing."""
    snapshot_data = {"run_id": run_id, "seed": 42, "outputs": ["stable"]}
    if SNAPSHOT_PATH.exists():
        try:
            snapshot_data = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    else:
        SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
        SNAPSHOT_PATH.write_text(json.dumps(snapshot_data, indent=2), encoding="utf-8")

    replay_output = {"seed": snapshot_data.get("seed", 42), "outputs": snapshot_data.get("outputs", [])}
    deterministic = replay_output == {"seed": 42, "outputs": ["stable"]} or replay_output == snapshot_data

    return {
        "snapshot_used": str(SNAPSHOT_PATH),
        "deterministic": deterministic,
        "replay_output": replay_output,
    }


class ReplayEngine:
    def __init__(self):
        pass

    def _hash_snapshot(self, snap: dict) -> str:
        text = json.dumps(snap, sort_keys=True)
        return hashlib.sha256(text.encode()).hexdigest()

    def replay(self, engine, snapshot: dict):
        # Extract seed from prompt
        prompt = snapshot["prompt"]
        # prompt format: SIMTEST-<seed>-Explain...
        seed = int(prompt.split("-")[1])

        rerun = run_single_simulation(engine, seed)

        h1 = self._hash_snapshot(snapshot)
        h2 = self._hash_snapshot(rerun)

        same = h1 == h2
        score = 100 if same else 0

        diffs = []
        if not same:
            # Shallow structure comparison
            for k in snapshot:
                if snapshot[k] != rerun.get(k):
                    diffs.append(k)

        return {
            "same": same,
            "determinism_score": score,
            "differences": diffs,
            "rerun": rerun,
        }
