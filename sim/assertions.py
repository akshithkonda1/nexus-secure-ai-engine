"""Deterministic assertions used by the simulation runner."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from ryuzen.toron_v25hplus import StateSnapshot
from ryuzen.toron_v25hplus.engine import SnapshotHasher


@dataclass
class SimulationAssertions:
    """Encapsulated assertion helpers for CI-safe verification."""

    latency_budget_ms: int = 120

    def assert_snapshot_integrity(self, snapshot: StateSnapshot) -> None:
        payload = snapshot.as_dict()
        assert payload["psl"]["claims"]
        assert isinstance(payload["execution_plan"]["stages"], tuple)
        assert payload["timestamp"] == snapshot.timestamp
        assert payload["reality_packet"]["consensus_score"] == snapshot.consensus_score

    def assert_stability(self, snapshots: Iterable[StateSnapshot]) -> None:
        digests = [SnapshotHasher(snapshot).hexdigest() for snapshot in snapshots]
        assert len(digests) == len(set(digests)), "Duplicate hashes detected; runs must be unique per prompt"

    def assert_latency_trace(self, latencies: Iterable[int]) -> None:
        for latency in latencies:
            assert 0 < latency <= self.latency_budget_ms

    def assert_expectation(self, expectation: str, consensus_score: float) -> None:
        assert expectation == "deterministic-consensus"
        assert consensus_score >= 0
