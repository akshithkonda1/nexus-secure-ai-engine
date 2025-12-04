from __future__ import annotations

import asyncio
import time

import pytest


pytestmark = pytest.mark.performance


async def _handle_request(idx: int) -> str:
    await asyncio.sleep(0.01)
    return f"resp-{idx}"


@pytest.mark.asyncio
async def test_parallel_throughput():
    total_requests = 100
    start = time.perf_counter()
    results = await asyncio.gather(*(_handle_request(i) for i in range(total_requests)))
    elapsed = time.perf_counter() - start
    throughput = total_requests / elapsed

    assert len(results) == total_requests
    assert throughput > 200
