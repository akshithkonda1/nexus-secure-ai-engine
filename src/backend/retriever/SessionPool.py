import asyncio
import time
import threading
from collections import deque
from typing import Deque, Dict, Optional, Tuple

import httpx


class SessionPool:
    """Region-aware pool for httpx sessions.

    Supports both async and sync clients. The pool keeps a bounded number of
    sessions per region, evicts idle/expired sessions, and provides gentle
    backoff when capacity is exhausted.
    """

    def __init__(
        self,
        max_sessions_per_region: int = 8,
        ttl_seconds: int = 600,
        idle_seconds: int = 180,
        backoff_seconds: float = 0.1,
        pool_keepalive: float = 15.0,
    ) -> None:
        self.max_sessions_per_region = max_sessions_per_region
        self.ttl_seconds = ttl_seconds
        self.idle_seconds = idle_seconds
        self.backoff_seconds = backoff_seconds
        self.pool_keepalive = pool_keepalive
        self._pools: Dict[str, Deque[Tuple[object, float, float]]] = {}
        self._locks: Dict[str, threading.Lock] = {}
        self._in_use: Dict[str, int] = {}
        self._global_lock = threading.Lock()

    def _get_lock(self, region: str) -> threading.Lock:
        with self._global_lock:
            if region not in self._locks:
                self._locks[region] = threading.Lock()
            return self._locks[region]

    def _pool(self, region: str) -> Deque[Tuple[object, float, float]]:
        with self._global_lock:
            if region not in self._pools:
                self._pools[region] = deque()
                self._in_use[region] = 0
            return self._pools[region]

    async def acquire(self, region: str = "global", asynchronous: bool = True, timeout: float = 5.0) -> object:
        """Acquire an httpx client for a region.

        When the pool is exhausted, this method backs off with jitter until a
        session becomes available or the timeout elapses.
        """

        end_time = time.time() + max(timeout, 0.1)
        pool = self._pool(region)
        lock = self._get_lock(region)
        attempt = 0

        while True:
            now = time.time()
            with lock:
                self._evict_locked(region, now)
                if pool:
                    session, created_at, _last_used = pool.popleft()
                    self._in_use[region] += 1
                    return session
                if self._in_use.get(region, 0) < self.max_sessions_per_region:
                    client = self._new_client(asynchronous)
                    self._in_use[region] += 1
                    return client

            # No session available and at capacity
            if time.time() >= end_time:
                # fail-open: create a temporary client
                with lock:
                    self._in_use[region] += 1
                return self._new_client(asynchronous)

            attempt += 1
            sleep_for = min(self.backoff_seconds * (2 ** min(attempt, 4)), 1.5)
            sleep_for = sleep_for * (0.7 + 0.6 * (asyncio.get_running_loop().time() % 1))
            await asyncio.sleep(sleep_for)

    def acquire_sync(self, region: str = "global", timeout: float = 5.0) -> object:
        """Blocking acquire wrapper for synchronous contexts."""

        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            return asyncio.run_coroutine_threadsafe(
                self.acquire(region=region, asynchronous=False, timeout=timeout), loop
            ).result()
        return asyncio.run(self.acquire(region=region, asynchronous=False, timeout=timeout))

    def release(self, region: str, session: object) -> None:
        """Return a session to the pool with updated timestamps."""

        now = time.time()
        pool = self._pool(region)
        lock = self._get_lock(region)
        with lock:
            self._in_use[region] = max(self._in_use.get(region, 1) - 1, 0)
            pool.append((session, now, now))

    async def cleanup(self) -> None:
        """Evict idle or expired sessions for all regions."""

        now = time.time()
        regions = list(self._pools.keys())
        for region in regions:
            lock = self._get_lock(region)
            with lock:
                self._evict_locked(region, now)

    def reset_pool(self) -> None:
        """Close and clear all pools."""

        regions = list(self._pools.keys())
        for region in regions:
            lock = self._get_lock(region)
            with lock:
                pool = self._pools.get(region, deque())
                while pool:
                    session, _c, _l = pool.popleft()
                    self._close_session(session)
                self._in_use[region] = 0
        self._pools.clear()
        self._locks.clear()
        self._in_use.clear()

    # -----------------------------
    # Internal helpers
    # -----------------------------
    def _evict_locked(self, region: str, now: float) -> None:
        pool = self._pool(region)
        fresh_pool: Deque[Tuple[object, float, float]] = deque()
        while pool:
            session, created_at, last_used = pool.popleft()
            if (now - created_at) > self.ttl_seconds or (now - last_used) > self.idle_seconds:
                self._close_session(session)
                continue
            fresh_pool.append((session, created_at, last_used))
        self._pools[region] = fresh_pool

    def _new_client(self, asynchronous: bool) -> object:
        common_kwargs = {
            "timeout": httpx.Timeout(10.0, connect=5.0),
            "headers": {"connection": "keep-alive"},
        }
        if asynchronous:
            return httpx.AsyncClient(http2=True, **common_kwargs)
        return httpx.Client(http2=True, **common_kwargs)

    def _close_session(self, session: object) -> None:
        try:
            if isinstance(session, httpx.AsyncClient):
                try:
                    loop = asyncio.get_running_loop()
                except RuntimeError:
                    loop = None
                if loop and loop.is_running():
                    asyncio.run_coroutine_threadsafe(session.aclose(), loop)
                else:
                    asyncio.run(session.aclose())
            elif isinstance(session, httpx.Client):
                session.close()
        except Exception:
            # Best-effort close
            pass

