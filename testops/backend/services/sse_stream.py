"""Server-Sent Events streaming utilities."""
from __future__ import annotations

import asyncio
from pathlib import Path
from typing import AsyncGenerator

from fastapi import HTTPException
from starlette.responses import StreamingResponse


async def _log_tail_generator(log_path: Path) -> AsyncGenerator[str, None]:
    """Yield log lines as SSE events."""
    with log_path.open("r", encoding="utf-8") as log_file:
        while True:
            line = log_file.readline()
            if line:
                yield f"event: log\ndata: {line.rstrip()}\n\n"
            else:
                await asyncio.sleep(0.5)


def stream_logs(log_path: Path) -> StreamingResponse:
    """Create a streaming response for SSE log streaming."""
    if not log_path.exists():
        raise HTTPException(status_code=404, detail="Log not found for run_id")
    return StreamingResponse(_log_tail_generator(log_path), media_type="text/event-stream")


__all__ = ["stream_logs"]
