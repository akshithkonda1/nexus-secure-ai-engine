import time
from typing import Dict, Tuple


class TierLimiter:
    TIERS: Dict[str, Dict[str, int]] = {
        "free": {"tokens_daily": 10_000, "throughput": 10, "models": 1},
        "student": {"tokens_daily": 50_000, "throughput": 20, "models": 2},
        "pro": {"tokens_daily": 200_000, "throughput": 60, "models": 4},
        "premium": {"tokens_daily": 1_000_000, "throughput": 120, "models": 8},
        "ultra": {"tokens_daily": 5_000_000, "throughput": 300, "models": 16},
    }

    def __init__(self) -> None:
        self.usage: Dict[str, Tuple[int, float]] = {}

    def allow(self, user_id: str, tier: str, tokens: int, models_used: int = 1) -> bool:
        tier_key = tier.lower()
        limits = self.TIERS.get(tier_key, self.TIERS["free"])
        tokens_used, last_reset = self.usage.get(user_id, (0, time.time()))

        if time.time() - last_reset > 86_400:
            tokens_used = 0
            last_reset = time.time()

        if tokens_used + tokens > limits["tokens_daily"]:
            return False
        if models_used > limits["models"]:
            return False

        self.usage[user_id] = (tokens_used + tokens, last_reset)
        return True

    def throughput_cap(self, tier: str) -> int:
        tier_key = tier.lower()
        limits = self.TIERS.get(tier_key, self.TIERS["free"])
        return limits["throughput"]

