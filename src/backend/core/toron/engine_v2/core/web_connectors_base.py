"""Shared utilities for Toron V2 web search connectors."""

from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from typing import Any, Callable

SEARCH_TIMEOUT = 8.0


class TimeoutManager:
    """Apply timeouts to blocking callables.

    Uses a dedicated thread pool per invocation to avoid interfering with
    running event loops. Propagates timeout errors for upstream handling.
    """

    def apply_timeout(self, func: Callable[..., Any], timeout: float, *args: Any, **kwargs: Any) -> Any:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(func, *args, **kwargs)
            try:
                return future.result(timeout=timeout)
            except TimeoutError:
                future.cancel()
                raise


timeout_manager = TimeoutManager()
toron_logger = logging.getLogger("toron.webconnectors")
