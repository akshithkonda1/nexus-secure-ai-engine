"""Resolve the effective pricing tier for a user."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import os
from typing import Optional


@dataclass(frozen=True)
class UserTierContext:
    """Lightweight user projection used for entitlement resolution."""

    id: str
    billing_tier: Optional[str] = None
    student_verified_until: Optional[datetime] = None
    student_grace_until: Optional[datetime] = None


def _normalize_isoformat(ts: str) -> datetime:
    """Parse ISO 8601 timestamps that may include a trailing Z."""

    ts = ts.strip()
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    parsed = datetime.fromisoformat(ts)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def get_effective_tier(user: UserTierContext, now: Optional[datetime] = None) -> str:
    """Return the effective tier for ``user`` given the current pricing mode."""

    now = now or datetime.now(timezone.utc)
    mode = os.getenv("PRICING_MODE", "ga_with_trials")
    founders_end = os.getenv("FOUNDERS_END")

    if mode == "founders_month" and founders_end:
        try:
            cutoff = _normalize_isoformat(founders_end)
        except ValueError:
            cutoff = None
        if cutoff and now < cutoff:
            return "premium"

    tier = (user.billing_tier or "").strip().lower()
    if tier in {"pro", "premium"}:
        return tier

    if tier == "student":
        if user.student_verified_until and user.student_verified_until >= now:
            return "student"
        if user.student_grace_until and user.student_grace_until >= now:
            return "student"
        return "premium"

    return "free"


__all__ = ["UserTierContext", "get_effective_tier"]
