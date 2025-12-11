"""Throughput profiler for Toron pipelines under load."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass
class PipelineSample:
    operations: int
    duration_seconds: float
    routing_overhead_seconds: float
    consensus_wait_seconds: float


DEFAULT_SAMPLES = [
    PipelineSample(operations=12000, duration_seconds=120, routing_overhead_seconds=14, consensus_wait_seconds=9),
    PipelineSample(operations=34000, duration_seconds=240, routing_overhead_seconds=31, consensus_wait_seconds=15),
]


def _compute_ops_per_second(sample: PipelineSample) -> float:
    return round(sample.operations / sample.duration_seconds, 3) if sample.duration_seconds else 0.0


def _compute_overhead_percentage(sample: PipelineSample) -> float:
    if sample.duration_seconds == 0:
        return 0.0
    return round((sample.routing_overhead_seconds / sample.duration_seconds) * 100, 2)


def _compute_consensus_pressure(sample: PipelineSample) -> float:
    if sample.duration_seconds == 0:
        return 0.0
    return round((sample.consensus_wait_seconds / sample.duration_seconds) * 100, 2)


def profile_throughput(samples: Iterable[PipelineSample] = DEFAULT_SAMPLES) -> dict[str, object]:
    """Measure pipeline efficiency and highlight bottlenecks."""

    sample_list = list(samples)
    ops_per_second = [_compute_ops_per_second(sample) for sample in sample_list]
    overhead = [_compute_overhead_percentage(sample) for sample in sample_list]
    consensus = [_compute_consensus_pressure(sample) for sample in sample_list]

    throughput_profile = {
        "ops_per_second": ops_per_second,
        "routing_overhead_pct": overhead,
        "consensus_bottlenecks_pct": consensus,
        "mean_ops_per_second": round(sum(ops_per_second) / len(ops_per_second), 3) if ops_per_second else 0.0,
        "max_routing_overhead_pct": max(overhead) if overhead else 0.0,
        "max_consensus_wait_pct": max(consensus) if consensus else 0.0,
    }

    return throughput_profile
