"""Global rate limiting for the API layer."""
from __future__ import annotations

import threading
import time


class GlobalRateLimiter:
    def __init__(self, max_requests: int = 100, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        self._requests: list[float] = []

    def check(self) -> None:
        """Raise an error if the window is saturated."""

        with self._lock:
            now = time.time()
            self._requests = [ts for ts in self._requests if now - ts < self.window_seconds]
            if len(self._requests) >= self.max_requests:
                raise RuntimeError("Global request rate limit reached")
            self._requests.append(now)

    def reset(self) -> None:
        with self._lock:
            self._requests.clear()
