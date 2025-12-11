"""Auto-recovery validation for Toron engines."""
from __future__ import annotations

from typing import List


class EngineProcess:
    """Simple mock of a Toron engine process."""

    def __init__(self, pid: int, healthy: bool = True, cached: bool = True):
        self.pid = pid
        self.healthy = healthy
        self.cached = cached

    def kill(self) -> None:
        self.healthy = False
        self.cached = False

    def restart(self, partial: bool = False) -> None:
        self.healthy = True
        self.cached = not partial


def validate_autorecovery(processes: List[EngineProcess] | None = None) -> dict[str, object]:
    """Simulate process failures and ensure Toron self-heals."""

    engine_processes = processes or [EngineProcess(pid, True, True) for pid in range(1, 4)]

    for process in engine_processes:
        process.kill()

    # Partial restart: only bring back half of the engines to force rerouting logic
    for process in engine_processes[:2]:
        process.restart(partial=True)

    cache_rebuilt = all(proc.cached for proc in engine_processes[:2])
    routing_consistent = all(proc.healthy for proc in engine_processes[:2]) and not engine_processes[2].healthy
    snapshots_intact = routing_consistent and cache_rebuilt

    recovery_score = 0
    recovery_score += 40 if cache_rebuilt else 0
    recovery_score += 40 if routing_consistent else 0
    recovery_score += 20 if snapshots_intact else 0

    return {
        "processes": [{"pid": proc.pid, "healthy": proc.healthy, "cached": proc.cached} for proc in engine_processes],
        "cache_rebuilt": cache_rebuilt,
        "routing_consistent": routing_consistent,
        "snapshots_intact": snapshots_intact,
        "recovery_score": recovery_score,
    }
