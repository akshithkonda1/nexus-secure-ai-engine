"""SSE streaming helpers for master runner."""
from __future__ import annotations

import asyncio
from typing import AsyncIterator, Dict


class SSEManager:
    def __init__(self) -> None:
        self.queues: Dict[str, asyncio.Queue[str]] = {}

    def create_stream(self, run_id: str) -> asyncio.Queue[str]:
        queue = asyncio.Queue[str]()
        self.queues[run_id] = queue
        return queue

    def push(self, run_id: str, message: str) -> None:
        queue = self.queues.get(run_id)
        if queue is None:
            queue = self.create_stream(run_id)
        queue.put_nowait(message)

    async def stream(self, run_id: str) -> AsyncIterator[dict]:
        queue = self.queues.get(run_id)
        if queue is None:
            return
        while True:
            try:
                message = await asyncio.wait_for(queue.get(), timeout=1.0)
                yield {"event": "message", "data": message}
            except asyncio.TimeoutError:
                continue


sse_manager = SSEManager()

__all__ = ["sse_manager", "SSEManager"]
