import threading
import time
from typing import Dict, Tuple


class TokenBucket:
    def __init__(self, capacity: int, refill_rate_per_sec: float) -> None:
        self.capacity = capacity
        self.refill_rate_per_sec = refill_rate_per_sec
        self.tokens = float(capacity)
        self.updated_at = time.time()

    def consume(self, amount: float = 1.0) -> bool:
        now = time.time()
        elapsed = now - self.updated_at
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate_per_sec)
        self.updated_at = now
        if self.tokens >= amount:
            self.tokens -= amount
            return True
        return False


class UserRateLimiter:
    def __init__(self, per_minute: int = 120, per_hour: int = 2000) -> None:
        self.per_minute = per_minute
        self.per_hour = per_hour
        self._lock = threading.Lock()
        self._buckets: Dict[str, Tuple[TokenBucket, TokenBucket]] = {}

    def allow(self, user_id: str, weight: float = 1.0) -> bool:
        with self._lock:
            minute_bucket, hour_bucket = self._get_buckets(user_id)
            return minute_bucket.consume(weight) and hour_bucket.consume(weight)

    def _get_buckets(self, user_id: str) -> Tuple[TokenBucket, TokenBucket]:
        if user_id not in self._buckets:
            self._buckets[user_id] = (
                TokenBucket(self.per_minute, self.per_minute / 60.0),
                TokenBucket(self.per_hour, self.per_hour / 3600.0),
            )
        return self._buckets[user_id]

