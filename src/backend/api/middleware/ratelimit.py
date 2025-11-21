"""Rate limiting middleware for the backend API layer.

The implementation uses lightweight in-memory guards to protect the API during
local development. Swap these primitives for a distributed store (e.g., Redis)
when deploying to production clusters.
"""
from __future__ import annotations

import asyncio
import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

_WINDOW_SECONDS = 60


class GlobalRateLimiter:
    """Simple sliding-window global limiter."""

    def __init__(self, limit: int = 1000) -> None:
        self.limit = limit
        self._events: Deque[float] = deque()
        self._lock = asyncio.Lock()

    async def allow(self) -> bool:
        now = time.monotonic()
        async with self._lock:
            self._prune(now)
            if len(self._events) >= self.limit:
                return False
            self._events.append(now)
            return True

    def _prune(self, now: float) -> None:
        while self._events and now - self._events[0] > _WINDOW_SECONDS:
            self._events.popleft()


class UserRateLimiter:
    """Per-user limiter keyed by a stable identifier such as a token or IP."""

    def __init__(self, limit: int = 120) -> None:
        self.limit = limit
        self._events: Dict[str, Deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def allow(self, user_id: str) -> bool:
        now = time.monotonic()
        async with self._lock:
            events = self._events[user_id]
            self._prune(events, now)
            if len(events) >= self.limit:
                return False
            events.append(now)
            return True

    def _prune(self, events: Deque[float], now: float) -> None:
        while events and now - events[0] > _WINDOW_SECONDS:
            events.popleft()


class ConcurrencyGate:
    """Limits concurrent in-flight requests."""

    def __init__(self, max_concurrent: int = 100) -> None:
        self.max_concurrent = max_concurrent
        self._semaphore = asyncio.Semaphore(max_concurrent)

    async def __aenter__(self) -> "ConcurrencyGate":
        await self._semaphore.acquire()
        return self

    async def __aexit__(self, *_: object) -> None:
        self._semaphore.release()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Applies global, per-user, and concurrency limits."""

    def __init__(self, app: FastAPI) -> None:
        super().__init__(app)
        self.global_limiter = GlobalRateLimiter()
        self.user_limiter = UserRateLimiter()
        self.concurrency_gate = ConcurrencyGate()

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        user_id = self._resolve_user(request)

        async with self.concurrency_gate:
            if not await self.global_limiter.allow():
                return self._reject("global_rate_limit_exceeded", "Too many requests globally")

            if not await self.user_limiter.allow(user_id):
                return self._reject("user_rate_limit_exceeded", "Too many requests for this user")

            response = await call_next(request)
            return response

    def _resolve_user(self, request: Request) -> str:
        token = request.headers.get("X-User-Id") or request.client.host if request.client else "anonymous"
        return token or "anonymous"

    def _reject(self, error_type: str, message: str) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content={"error": message, "type": error_type, "details": {}},
        )


def apply_rate_limiting(app: FastAPI) -> None:
    """Attach the rate limiting middleware to the app."""

    app.add_middleware(RateLimitMiddleware)

