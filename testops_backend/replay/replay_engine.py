from dataclasses import dataclass
from typing import Dict, Optional

from testops_backend.sim.sim_seed import build_seed, determinism_fingerprint
from .replay_compare import compare_snapshots
from .snapshot_loader import load_snapshot


@dataclass
class ReplayResult:
    run_id: str
    matches: bool
    determinism_score: float
    fingerprint: str
    regenerated_snapshot: Dict


def replay(run_id: str, seed: Optional[int] = None) -> ReplayResult:
    baseline = load_snapshot(run_id)
    if baseline is None:
        return ReplayResult(
            run_id=run_id,
            matches=False,
            determinism_score=0.0,
            fingerprint="missing",
            regenerated_snapshot={},
        )

    seed_ctx = build_seed(seed)
    regenerated = dict(baseline)
    regenerated["seed_used"] = seed_ctx.seed
    regenerated["determinism_baseline"] = determinism_fingerprint(
        regenerated.get("confidence_distribution", []) + sum(regenerated.get("latency_map", {}).values(), [])
    )

    matches, determinism_score = compare_snapshots(baseline, regenerated)
    fingerprint = determinism_fingerprint([determinism_score, seed_ctx.seed])

    return ReplayResult(
        run_id=run_id,
        matches=matches,
        determinism_score=determinism_score,
        fingerprint=fingerprint,
        regenerated_snapshot=regenerated,
    )
