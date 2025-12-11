from __future__ import annotations

import time
from pathlib import Path
from random import Random
from typing import Any, Dict

try:
    from ..master_runner import LOG_DIR, RunState, master_runner
except Exception:  # pragma: no cover - fallback for isolated execution
    LOG_DIR = Path("backend/logs/master")
    master_runner = None
    RunState = None

LOG_DIR.mkdir(parents=True, exist_ok=True)
MODULE_LOG = LOG_DIR / "engine_hardening.log"


def _log(run_id: str, message: str) -> None:
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    line = f"[{timestamp}] [run:{run_id}] [cache_stress] {message}\n"
    with MODULE_LOG.open("a", encoding="utf-8") as handle:
        handle.write(line)


def _register_result(run_id: str, payload: Dict[str, Any]) -> None:
    if not master_runner:
        return
    try:
        state = master_runner.run_states.get(run_id)
        if state is None and RunState:
            state = RunState(run_id=run_id)
            master_runner.run_states[run_id] = state
        if state is not None:
            state.results["cache_stress"] = payload
    except Exception:
        return


def run_cache_stress(run_id: str = "offline", seed: int = 1212, keys: int = 10_000) -> Dict[str, Any]:
    rng = Random(seed)
    cache: Dict[str, Dict[str, Any]] = {}
    stale_reads = 0
    collisions = 0

    for idx in range(keys):
        key = f"synthetic:{idx}" if idx % 3 else f"collision:{idx % 97}"
        value = rng.randint(1, 10_000)
        ttl = rng.randint(3, 9)
        now = idx % 50
        bucket = cache.setdefault(key, {"versions": []})
        bucket["versions"].append({"value": value, "ttl": ttl, "created_at": now})
        if key.startswith("collision") and len(bucket["versions"]) > 1:
            collisions += 1

    for key, payload in cache.items():
        versions = payload.get("versions", [])
        for version in versions:
            expired = (version["created_at"] + version["ttl"]) < 40
            if expired:
                continue
            latest = max(versions, key=lambda v: v["created_at"])
            if latest is not version:
                stale_reads += 1
        _log(run_id, f"checked key {key} versions={len(versions)}")

    health_penalty = (stale_reads * 0.0005) + (collisions * 0.0002)
    cache_health_score = max(0.0, round(1.0 - health_penalty, 3))

    payload = {
        "cache_health_score": cache_health_score,
        "stale_reads": stale_reads,
        "collisions": collisions,
        "keys_written": keys,
        "seed": seed,
    }
    _register_result(run_id, payload)
    return payload


__all__ = ["run_cache_stress"]
