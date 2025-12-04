"""
HealthMonitor — provider-level circuit breaker + health tracking.

- Tracks failures per provider
- Marks providers temporarily "down" after N failures
- Automatically allows retry after cooldown period
"""

from __future__ import annotations

import time
from typing import Any, Dict


class HealthMonitor:
    def __init__(
        self,
        providers: list[str],
        failure_threshold: int = 3,
        cooldown_seconds: int = 60,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds

        # provider -> state
        self.state: Dict[str, Dict[str, Any]] = {
            p: {
                "failures": 0,
                "down_until": 0.0,
                "healthy": True,
                "last_error": None,
            }
            for p in providers
        }

    def can_use(self, provider: str) -> bool:
        """Return True if provider is allowed to be used right now."""
        info = self.state.get(provider)
        if not info:
            return False

        now = time.time()

        # If provider is in cooldown window, skip it
        if info["down_until"] and now < info["down_until"]:
            return False

        # If cooldown expired, reset
        if info["down_until"] and now >= info["down_until"]:
            info["down_until"] = 0.0
            info["failures"] = 0
            info["healthy"] = True
            info["last_error"] = None

        return True

    def mark_failure(self, provider: str, reason: str | None = None) -> None:
        """Record a failure and possibly trip the circuit."""
        info = self.state.setdefault(
            provider,
            {"failures": 0, "down_until": 0.0, "healthy": True, "last_error": None},
        )

        info["failures"] += 1
        info["last_error"] = reason

        if info["failures"] >= self.failure_threshold:
            info["healthy"] = False
            info["down_until"] = time.time() + self.cooldown_seconds

    def mark_success(self, provider: str) -> None:
        """Reset provider back to healthy after successful call."""
        info = self.state.setdefault(
            provider,
            {"failures": 0, "down_until": 0.0, "healthy": True, "last_error": None},
        )
        info["failures"] = 0
        info["down_until"] = 0.0
        info["healthy"] = True
        info["last_error"] = None

    def snapshot(self) -> Dict[str, Dict[str, Any]]:
        """Return a copy of the health state for logging/telemetry."""
        return {k: dict(v) for k, v in self.state.items()}
