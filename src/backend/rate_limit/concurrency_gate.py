"""Concurrency guard for orchestrated workloads."""
from __future__ import annotations

import contextlib
import threading


class ConcurrencyGate:
    def __init__(self, max_concurrent: int = 10) -> None:
        self._semaphore = threading.Semaphore(max_concurrent)

    @contextlib.contextmanager
    def track(self):
        acquired = self._semaphore.acquire(blocking=False)
        if not acquired:
            raise RuntimeError("Concurrency limit reached")
        try:
            yield
        finally:
            self._semaphore.release()
