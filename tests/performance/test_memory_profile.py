from __future__ import annotations

import tracemalloc

import pytest


pytestmark = pytest.mark.performance


def heavy_operation(iterations: int = 50) -> int:
    # Simulate repeated debate engine calls with small allocations
    return sum(len(str(i)) for i in range(iterations))


def test_memory_profile_stabilizes():
    tracemalloc.start()
    baseline = heavy_operation()
    snapshot1 = tracemalloc.take_snapshot()
    _ = [heavy_operation(100) for _ in range(10)]
    snapshot2 = tracemalloc.take_snapshot()
    stats1 = snapshot1.statistics("filename")
    stats2 = snapshot2.statistics("filename")
    baseline_size = sum(stat.size for stat in stats1)
    final_size = sum(stat.size for stat in stats2)

    assert final_size - baseline_size < 1_000_000  # < 1MB growth
    tracemalloc.stop()
