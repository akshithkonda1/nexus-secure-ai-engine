import threading
import time
from collections import deque
from typing import Deque, Dict


class GlobalRateLimiter:
    def __init__(self, max_requests: int = 10_000, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        self._events: Deque[float] = deque()

    def allow(self) -> bool:
        now = time.time()
        with self._lock:
            self._trim(now)
            if len(self._events) >= self.max_requests:
                return False
            self._events.append(now)
            return True

    def backoff_hint(self) -> float:
        with self._lock:
            if not self._events:
                return 0.0
            oldest = self._events[0]
            return max(0.0, (oldest + self.window_seconds) - time.time())

    def _trim(self, now: float) -> None:
        while self._events and now - self._events[0] > self.window_seconds:
            self._events.popleft()

