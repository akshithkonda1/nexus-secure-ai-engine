"""Timeout helpers for deterministic Toron simulations."""

from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from functools import wraps
from typing import Any, Callable, ParamSpec, TypeVar

from .toron_logger import get_logger, log_event

MODEL_TIMEOUT: float = 10.0
SEARCH_TIMEOUT: float = 7.0

P = ParamSpec("P")
T = TypeVar("T")
logger = get_logger("nexus.timeout")


def apply_timeout(timeout: float | None = None) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator enforcing a hard timeout on sync or async callables.

    The decorator uses ``asyncio.wait_for`` for coroutines and a dedicated
    thread with ``Future.result(timeout=...)`` for synchronous functions.
    A :class:`TimeoutError` is raised when the limit is exceeded.
    """

    effective_timeout = timeout or MODEL_TIMEOUT

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        if asyncio.iscoroutinefunction(func):

            @wraps(func)
            async def async_wrapper(*args: P.args, **kwargs: P.kwargs) -> T:  # type: ignore[misc]
                log_event(logger, "timeout.start", func=func.__name__, timeout=effective_timeout)
                try:
                    return await asyncio.wait_for(func(*args, **kwargs), effective_timeout)
                except asyncio.TimeoutError as exc:  # pragma: no cover - passthrough path
                    log_event(logger, "timeout.hit", func=func.__name__, timeout=effective_timeout)
                    raise TimeoutError(f"{func.__name__} exceeded {effective_timeout}s") from exc

            return async_wrapper  # type: ignore[return-value]

        @wraps(func)
        def sync_wrapper(*args: P.args, **kwargs: P.kwargs) -> T:  # type: ignore[misc]
            log_event(logger, "timeout.start", func=func.__name__, timeout=effective_timeout)
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(func, *args, **kwargs)
                try:
                    return future.result(timeout=effective_timeout)
                except FuturesTimeoutError as exc:
                    log_event(logger, "timeout.hit", func=func.__name__, timeout=effective_timeout)
                    raise TimeoutError(f"{func.__name__} exceeded {effective_timeout}s") from exc

        return sync_wrapper  # type: ignore[return-value]

    return decorator


__all__ = ["apply_timeout", "MODEL_TIMEOUT", "SEARCH_TIMEOUT"]
