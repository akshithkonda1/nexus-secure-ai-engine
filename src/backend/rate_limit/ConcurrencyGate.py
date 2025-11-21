import contextlib
import threading
from typing import Generator


class ConcurrencyGate:
    def __init__(self, limit: int = 128, timeout: float = 30.0, fail_open: bool = False) -> None:
        self.limit = limit
        self.timeout = timeout
        self.fail_open = fail_open
        self._sem = threading.BoundedSemaphore(limit)

    @contextlib.contextmanager
    def acquire(self) -> Generator[bool, None, None]:
        acquired = self._sem.acquire(timeout=self.timeout)
        if not acquired and self.fail_open:
            yield False
            return
        try:
            yield True
        finally:
            if acquired:
                self._sem.release()

    def available(self) -> int:
        # BoundedSemaphore does not expose permits; approximate using private value
        return max(0, self._sem._value)  # type: ignore[attr-defined]

