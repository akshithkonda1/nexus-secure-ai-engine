import time
from typing import Dict


class HealthMonitor:
    """Tracks provider health and simple circuit-breaker state."""

    def __init__(self, providers, failure_threshold: int = 3, cooldown_seconds: int = 60):
        now = time.time()
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.status: Dict[str, dict] = {
            p: {
                "failures": 0,
                "healthy": True,
                "last_error": None,
                "cooldown_until": now,
            }
            for p in providers
        }

    def can_use(self, provider: str) -> bool:
        state = self.status.get(provider)
        if not state:
            return False

        if not state["healthy"] and time.time() >= state["cooldown_until"]:
            state["healthy"] = True
            state["failures"] = 0
        return state["healthy"]

    def mark_success(self, provider: str) -> None:
        state = self.status.setdefault(provider, {})
        state.update({
            "failures": 0,
            "healthy": True,
            "last_error": None,
            "cooldown_until": time.time(),
        })

    def mark_failure(self, provider: str, error: str) -> None:
        state = self.status.setdefault(provider, {
            "failures": 0,
            "healthy": True,
            "last_error": None,
            "cooldown_until": time.time(),
        })
        state["failures"] += 1
        state["last_error"] = error
        if state["failures"] >= self.failure_threshold:
            state["healthy"] = False
            state["cooldown_until"] = time.time() + self.cooldown_seconds

    def snapshot(self) -> Dict[str, dict]:
        return {k: v.copy() for k, v in self.status.items()}
