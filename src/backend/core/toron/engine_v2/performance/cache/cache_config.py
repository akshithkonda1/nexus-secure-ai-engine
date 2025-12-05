"""Cache configuration for Toron Engine v2 performance layer."""

from dataclasses import dataclass
from typing import Tuple


@dataclass(frozen=True)
class CacheConfig:
    """Centralized cache sizing and TTL policy configuration."""

    l1_max_size: int = 512
    ttl_range: Tuple[int, int] = (60, 24 * 3600)
    cold_storage_threshold_bytes: int = 8 * 1024
    cold_storage_ttl_threshold: int = 3600
    redis_url: str = "redis://localhost:6379/0"
    s3_bucket: str = "toron-cache-bucket"
    s3_prefix: str = "toron/cache/"

    def clamp_ttl(self, ttl: int) -> int:
        lower, upper = self.ttl_range
        return max(lower, min(ttl, upper))
