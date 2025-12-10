"""Simulation runner for Toron v2.5H+."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List

from ryuzen.toron_v25hplus import ModelAssuranceLayer, RyuzenEngine
from ryuzen.toron_v25hplus.engine import SnapshotHasher, StateSnapshot

from .assertions import SimulationAssertions
from .dataset import SyntheticDatasetGenerator
from .reporter import SimulationRecord, SimulationReporter
from .telemetry_stub import TelemetryPIISanitizer
from .war_room_report import WarRoomLogger


@dataclass
class SimulationRunner:
    """Run deterministic simulation scenarios and persist metrics."""

    dataset: SyntheticDatasetGenerator
    assertions: SimulationAssertions
    reporter: SimulationReporter
    mal: ModelAssuranceLayer
    telemetry: TelemetryPIISanitizer
    war_room: WarRoomLogger

    def run(self, count: int = 3, target_rps: float = 30.0) -> List[StateSnapshot]:
        engine = RyuzenEngine()
        snapshots: List[StateSnapshot] = []
        for record in self.dataset.generate(count):
            scrubbed_prompt = self.telemetry.scrub_text(record.prompt)
            snapshot = engine.execute(scrubbed_prompt, witnesses=[record.witness])
            self.assertions.assert_snapshot_integrity(snapshot)
            self.assertions.assert_expectation(record.expectation, snapshot.consensus_score)

            mal_result = self.mal.retry(signature=record.prompt, failure_budget=record.failure_budget)
            self.assertions.assert_latency_trace(mal_result["latency_trace"])
            self.war_room.log("MAL_ATTEMPT", {"attempts": mal_result["attempts"]})

            hash_value = SnapshotHasher(snapshot).hexdigest()
            report_record = SimulationRecord(
                prompt=record.prompt,
                snapshot_hash=hash_value,
                consensus_score=snapshot.consensus_score,
                latency_trace=mal_result["latency_trace"],
                mal_attempts=mal_result["attempts"],
            )
            self.reporter.add_record(report_record)
            snapshots.append(snapshot)

        self.assertions.assert_stability(snapshots)
        self.reporter.persist(target_rps)
        return snapshots

    def replay(self, snapshots: Iterable[StateSnapshot]) -> List[str]:
        hashes: List[str] = []
        for snapshot in snapshots:
            hashes.append(SnapshotHasher(snapshot).hexdigest())
            self.war_room.log("REPLAY", {"snapshot_hash": hashes[-1]})
        return hashes
