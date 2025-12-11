import asyncio
from datetime import datetime
from typing import Dict, List
from testops_backend.core import store
from testops_backend.core.models import RunState
from .master_models import LogEvent


class StreamBroker:
    def __init__(self) -> None:
        self.streams: Dict[str, asyncio.Queue] = {}

    def create_stream(self, run_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self.streams[run_id] = queue
        return queue

    def get_stream(self, run_id: str) -> asyncio.Queue:
        return self.streams.setdefault(run_id, asyncio.Queue())

    async def push(self, run_id: str, event: LogEvent) -> None:
        queue = self.get_stream(run_id)
        await queue.put(event)

    async def finalize(self, run_id: str) -> None:
        queue = self.get_stream(run_id)
        await queue.put(None)


broker = StreamBroker()


def record_run_start(run_id: str) -> None:
    now = datetime.utcnow().isoformat()
    store.create_run(run_id, now)
    store.update_status(run_id, RunState.running.value, "Run started", now)


def record_run_state(run_id: str, state: RunState, summary: str) -> None:
    now = datetime.utcnow().isoformat()
    store.update_status(run_id, state.value, summary, now)


def record_log(run_id: str, event: LogEvent) -> None:
    store.append_log(run_id, event.timestamp, event.level, event.message)


def persist_result(run_id: str, payload: dict) -> None:
    store.save_result(run_id, payload)
