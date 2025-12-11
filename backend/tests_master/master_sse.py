from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, List

from backend.tests_master.master_models import StreamEvent


class SSEManager:
    def __init__(self) -> None:
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, run_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        async with self._lock:
            self._subscribers.setdefault(run_id, []).append(queue)
        return queue

    async def unsubscribe(self, run_id: str, queue: asyncio.Queue) -> None:
        async with self._lock:
            if run_id in self._subscribers:
                self._subscribers[run_id] = [q for q in self._subscribers[run_id] if q is not queue]
                if not self._subscribers[run_id]:
                    self._subscribers.pop(run_id)

    async def publish(self, run_id: str, event: StreamEvent) -> None:
        async with self._lock:
            queues = list(self._subscribers.get(run_id, []))
        for queue in queues:
            await queue.put(event.serialize())

    async def close(self, run_id: str) -> None:
        async with self._lock:
            queues = list(self._subscribers.get(run_id, []))
        for queue in queues:
            await queue.put(None)


def _format_sse(data: Dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


sse_manager = SSEManager()


async def event_stream(run_id: str) -> AsyncGenerator[str, None]:
    queue = await sse_manager.subscribe(run_id)
    try:
        while True:
            try:
                item = await asyncio.wait_for(queue.get(), timeout=10)
            except asyncio.TimeoutError:
                heartbeat = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "module": "heartbeat",
                    "progress": 0,
                    "status": "alive",
                    "message": "keep-alive",
                }
                yield _format_sse(heartbeat)
                continue
            if item is None:
                break
            yield _format_sse(item)
    finally:
        await sse_manager.unsubscribe(run_id, queue)
