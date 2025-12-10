"""State snapshot serialization coverage."""

from __future__ import annotations

from ryuzen.toron_v25hplus import ExecutionPlan, RyuzenEngine


PASSAGE = "Deterministic witnesses keep the record straight."


def test_snapshot_contains_all_keys() -> None:
    engine = RyuzenEngine()
    snapshot = engine.execute(PASSAGE, witnesses=[{"name": "atlas", "reliability": 0.88}])
    ordered = snapshot.to_ordered_dict()

    assert list(ordered.keys()) == [
        "psl",
        "tier1",
        "tier2",
        "reality_packet",
        "judicial",
        "consensus_score",
        "execution_plan",
        "timestamp",
    ]


def test_execution_plan_serialises_with_asdict() -> None:
    plan = ExecutionPlan(stages=("a", "b"), version="v2.5H+", parameters={"demo": True})
    snapshot = plan.describe()

    assert snapshot["stages"] == ("a", "b")
    assert snapshot["version"] == "v2.5H+"
    assert snapshot["parameters"] == {"demo": True}


def test_snapshot_is_deterministic_and_complete() -> None:
    engine = RyuzenEngine()
    snapshot = engine.execute(PASSAGE, witnesses=[{"name": "atlas", "reliability": 0.88}])
    payload = snapshot.as_dict()

    assert payload["psl"]["claims"][0]["text"].startswith("Deterministic")
    assert payload["reality_packet"]["graph"]["nodes"][0].startswith("Deterministic")
    assert payload["consensus_score"] == snapshot.consensus_score
    assert isinstance(payload["execution_plan"]["stages"], tuple)
    assert payload["timestamp"] == 0
