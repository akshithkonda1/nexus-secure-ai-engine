"""Reporter helpers for the Toron v2.5H+ simulation suite."""

from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List

from .metrics import SimulationMetrics


@dataclass
class SimulationRecord:
    prompt: str
    snapshot_hash: str
    consensus_score: float
    latency_trace: tuple[int, ...]
    mal_attempts: int

    def as_dict(self) -> Dict[str, object]:  # pragma: no cover - simple serializer
        return asdict(self)


class SimulationReporter:
    """Accumulates simulation run results and persists JSON reports."""

    def __init__(self, metrics_path: str | Path = "sim/metrics.json") -> None:
        self.records: List[SimulationRecord] = []
        self.metrics_path = Path(metrics_path)
        self.metrics_path.parent.mkdir(parents=True, exist_ok=True)

    def add_record(self, record: SimulationRecord) -> None:
        self.records.append(record)

    def build_metrics(self, rps: float) -> SimulationMetrics:
        latencies: List[int] = [lat for record in self.records for lat in record.latency_trace]
        failures = sum(1 for record in self.records if record.consensus_score <= 0)
        return SimulationMetrics.from_latency_trace(latencies, rps, failures)

    def persist(self, rps: float) -> Dict[str, object]:
        metrics = self.build_metrics(rps)
        payload = {
            "metrics": metrics.as_dict(),
            "records": [record.as_dict() for record in self.records],
        }
        with self.metrics_path.open("w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
        return payload
