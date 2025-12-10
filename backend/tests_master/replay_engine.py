import json
import hashlib
import copy
from .sim_runner import run_single_simulation


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
