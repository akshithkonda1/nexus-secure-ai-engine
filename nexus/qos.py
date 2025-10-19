"""Quality-of-service guardrails for API usage."""
from __future__ import annotations

import os
import time
from functools import wraps
from typing import Any, Callable, Protocol

import redis

from .entitlements import entitlement_for, load_entitlements
from .plan_resolver import UserTierContext, get_effective_tier

_RedisKeyFunc = Callable[[], str]


class _UserProvider(Protocol):
    def __call__(self, *args: Any, **kwargs: Any) -> UserTierContext:
        ...


def _bucket(key: str, rate_per_min: float, burst_cap: float, *, now: float | None = None) -> bool:
    now = now or time.time()
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    client = redis.Redis.from_url(redis_url)
    tokens, ts = client.hmget(key, "t", "s")
    tokens = float(tokens or rate_per_min)
    last = float(ts or now)
    tokens = min(burst_cap, tokens + (rate_per_min / 60.0) * (now - last))
    ok = tokens >= 1.0
    if ok:
        tokens -= 1.0
    client.hmset(key, {"t": tokens, "s": now})
    client.expire(key, 120)
    return ok


def enforce_qos(user_provider: _UserProvider, *, tier_name_fn: Callable[[UserTierContext], str] | None = None) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any):
            user = user_provider(*args, **kwargs)
            tier_name = tier_name_fn(user) if tier_name_fn else get_effective_tier(user)
            load_entitlements()  # ensure cache is populated
            tier = entitlement_for(tier_name)
            client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))
            uid = user.id
            concurrency_key = f"q:conc:{uid}"
            current = client.incr(concurrency_key)
            if current > int(tier.get("concurrency", 1)):
                client.decr(concurrency_key)
                from nexus.audit_logger import log_event, Actor

                log_event(
                    "qos.concurrency_limited",
                    Actor(user_id=uid, tier=tier_name),
                    {"endpoint": getattr(func, "__name__", "unknown")},
                )
                return {"error": "Too many parallel requests"}, 429
            client.expire(concurrency_key, 10)
            try:
                rpm = float(tier.get("rpm", 60))
                burst_x = float(tier.get("burst_x", 1))
                if not _bucket(f"q:rpm:{uid}", rpm, rpm * burst_x):
                    from nexus.audit_logger import log_event, Actor

                    log_event(
                        "qos.rpm_limited",
                        Actor(user_id=uid, tier=tier_name),
                        {"endpoint": getattr(func, "__name__", "unknown")},
                    )
                    return {"error": "Rate limited (rpm). Try again shortly."}, 429

                token_hint = kwargs.get("estimated_tokens")
                if token_hint is None:
                    try:
                        from flask import request

                        body = request.get_json(silent=True) or {}
                        token_hint = body.get("estimated_tokens")
                    except Exception:
                        token_hint = None
                need_tokens = max(1, int((token_hint or 1000) / 1000))
                tpm = float(tier.get("tpm", 60000)) / 1000.0
                for _ in range(need_tokens):
                    if not _bucket(f"q:tpm:{uid}", tpm, tpm * burst_x):
                        from nexus.audit_logger import log_event, Actor

                        log_event(
                            "qos.tpm_limited",
                            Actor(user_id=uid, tier=tier_name),
                            {
                                "endpoint": getattr(func, "__name__", "unknown"),
                                "need_tokens": need_tokens,
                            },
                        )
                        return {"error": "Rate limited (tpm)."}, 429

                return func(*args, **kwargs)
            finally:
                client.decr(concurrency_key)

        return wrapper

    return decorator


__all__ = ["enforce_qos"]
