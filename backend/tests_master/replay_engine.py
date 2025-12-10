import json
import hashlib


def run_single_simulation(engine, seed: int):
    """Execute a single simulation using the provided engine.

    The previous implementation attempted to import this helper from a
    non‑existent ``sim_runner`` module. To keep ``ReplayEngine`` self-contained
    while remaining flexible, we first look for an engine-level helper
    (``run_single_simulation``) and fall back to a generic ``run`` method. If
    neither is available, a clear error is raised so callers know the engine
    contract was not satisfied.
    """

    if hasattr(engine, "run_single_simulation"):
        return engine.run_single_simulation(seed)
    if hasattr(engine, "run"):
        return engine.run(seed)

    raise AttributeError(
        "Engine does not implement run_single_simulation(seed) or run(seed)"
    )


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
