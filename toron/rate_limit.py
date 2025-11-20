"""Token bucket rate limiter implementation."""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Callable


@dataclass
class TokenBucket:
    """A lightweight token bucket with pluggable time provider."""

    capacity: int
    fill_rate: float
    time_provider: Callable[[], float] = time.monotonic
    tokens: float = field(init=False)
    last_checked: float = field(init=False)

    def __post_init__(self) -> None:
        self.tokens = float(self.capacity)
        self.last_checked = self.time_provider()

    def _refill(self) -> None:
        now = self.time_provider()
        elapsed = max(0.0, now - self.last_checked)
        increment = elapsed * self.fill_rate
        self.tokens = min(self.capacity, self.tokens + increment)
        self.last_checked = now

    def allow(self, tokens: int = 1) -> bool:
        self._refill()
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False
