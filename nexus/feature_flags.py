"""Feature rollout helpers."""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
import json
from pathlib import Path

from .plan_resolver import UserTierContext, get_effective_tier

_CFG_PATH = Path(__file__).resolve().parent / "config" / "feature_rollout.json"

try:
    with _CFG_PATH.open("r", encoding="utf-8") as handle:
        CFG = json.load(handle)
except FileNotFoundError:  # pragma: no cover - deployment guard
    CFG = {}


def feature_enabled(user: UserTierContext, key: str, launched_at: datetime) -> bool:
    cfg = CFG.get(key)
    if not cfg:
        return False

    tier = get_effective_tier(user)
    waves = cfg.get("waves", {})
    pro_days = int(waves.get("pro_days", 0))
    premium_days_after_pro = int(waves.get("premium_days_after_pro", 0))
    delta: timedelta = datetime.now(timezone.utc) - launched_at

    if tier == "pro":
        return delta.days >= pro_days
    if tier in {"premium", "student"}:
        return delta.days >= pro_days + premium_days_after_pro
    return False


__all__ = ["feature_enabled"]
