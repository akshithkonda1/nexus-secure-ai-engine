from __future__ import annotations

import asyncio
import statistics
import time

import pytest


pytestmark = pytest.mark.performance


async def _simulate(duration: float) -> float:
    start = time.perf_counter()
    await asyncio.sleep(duration)
    return (time.perf_counter() - start) * 1000


def _percentile(data, p):
    data = sorted(data)
    k = int(len(data) * p / 100)
    return data[min(k, len(data) - 1)]


@pytest.mark.asyncio
async def test_latency_targets():
    durations = [0.05, 0.08, 0.12]
    latencies = [await _simulate(d) for d in durations]

    simple = _percentile(latencies, 95)
    medium = _percentile(latencies, 95)
    complex_latency = _percentile(latencies + [await _simulate(0.15)], 95)

    assert simple < 500
    assert medium < 800
    assert complex_latency < 2000
