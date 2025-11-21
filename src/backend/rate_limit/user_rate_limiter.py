"""Per-user rate limiting."""
from __future__ import annotations

import threading
import time
from collections import defaultdict


class UserRateLimiter:
    def __init__(self, max_requests: int = 30, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        self._requests: defaultdict[str, list[float]] = defaultdict(list)

    def check(self, user_id: str) -> None:
        with self._lock:
            now = time.time()
            window = self._requests[user_id]
            filtered = [ts for ts in window if now - ts < self.window_seconds]
            self._requests[user_id] = filtered
            if len(filtered) >= self.max_requests:
                raise RuntimeError("User rate limit reached")
            self._requests[user_id].append(now)

    def reset(self) -> None:
        with self._lock:
            self._requests.clear()
