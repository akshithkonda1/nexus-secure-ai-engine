"""End-to-end simulation harness tests for Toron v2.5H+."""

from __future__ import annotations

import json

from sim import (
    SimulationAssertions,
    SimulationReporter,
    SimulationRunner,
    SyntheticDatasetGenerator,
    TelemetryPIISanitizer,
)
from sim.replay import SimulationReplay
from sim.war_room_report import WarRoomLogger
from ryuzen.toron_v25hplus import ModelAssuranceLayer


def test_sim_runner_generates_reports(tmp_path) -> None:
    dataset = SyntheticDatasetGenerator(seed="ci-dataset")
    assertions = SimulationAssertions(latency_budget_ms=120)
    reporter = SimulationReporter(metrics_path=tmp_path / "metrics.json")
    mal = ModelAssuranceLayer()
    telemetry = TelemetryPIISanitizer()
    war_room = WarRoomLogger(path=tmp_path / "war_room.jsonl")
    runner = SimulationRunner(dataset, assertions, reporter, mal, telemetry, war_room)

    snapshots = runner.run(count=3, target_rps=30.0)
    metrics_path = tmp_path / "metrics.json"
    assert metrics_path.exists()

    with metrics_path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    assert payload["metrics"]["p95_latency"] <= assertions.latency_budget_ms
    assert payload["metrics"]["rps"] == 30.0
    assert len(payload["records"]) == 3

    replay = SimulationReplay(replay_path=tmp_path / "replays.jsonl")
    replay.persist(snapshots)
    loaded = replay.load()
    assert len(loaded) == 3


def test_dataset_generation_is_deterministic() -> None:
    dataset_a = SyntheticDatasetGenerator(seed="alpha").generate(count=2)
    dataset_b = SyntheticDatasetGenerator(seed="alpha").generate(count=2)

    assert dataset_a == dataset_b
    assert dataset_a[0].expectation == "deterministic-consensus"


def test_replay_handles_missing_file(tmp_path) -> None:
    replay = SimulationReplay(replay_path=tmp_path / "missing.jsonl")
    assert replay.load() == []
