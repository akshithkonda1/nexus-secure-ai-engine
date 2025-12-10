"""Synthetic CI coverage for the Ryuzen Toron v2.5H+ engine."""

from __future__ import annotations

import json

from ryuzen.toron_v25hplus import (
    CausalDirectedGraph,
    ConsensusComputer,
    JudicialLogic,
    ModelExecutionTier,
    PremiseStructureLayer,
    RealityPacketBuilder,
    ReliableWitnessLocator,
    RyuzenEngine,
    TierTwoResult,
    TierTwoValidator,
    Witness,
)


PASSAGE = "The engine is deterministic. It never calls external APIs. Maybe it caches every decision."


def test_psl_produces_correct_structure() -> None:
    psl = PremiseStructureLayer().structure(PASSAGE)
    claim_text = [premise.text for premise in psl["claims"]]
    labels = [premise.label for premise in psl["claims"]]

    assert len(claim_text) == 3
    assert "deterministic" in claim_text[0]
    assert labels == ["true", "false", "uncertain"]
    assert psl["token_count"] == len(PASSAGE.split())


def test_tier1_executes_synthetic_models() -> None:
    psl = PremiseStructureLayer().structure(PASSAGE)
    tier1 = ModelExecutionTier(models=("alpha", "beta")).run(psl)

    assert set(tier1.keys()) == {"alpha", "beta"}
    alpha_scores = [entry["score"] for entry in tier1["alpha"]]
    beta_scores = [entry["score"] for entry in tier1["beta"]]
    repeat = [entry["score"] for entry in ModelExecutionTier(models=("alpha",)).run(psl)["alpha"]]
    assert alpha_scores == repeat
    assert alpha_scores[0] != beta_scores[0]


def test_cdg_summary_is_valid() -> None:
    psl = PremiseStructureLayer().structure(PASSAGE)
    cdg = CausalDirectedGraph(psl["claims"])
    summary = cdg.summary()

    assert summary["nodes"][0] == "The engine is deterministic"
    assert len(summary["edges"]) == len(summary["nodes"]) - 1
    assert summary["connected"] is True


def test_tier2_detects_contradictions() -> None:
    tier2 = TierTwoValidator().evaluate(
        {"alpha": ({"model": "alpha", "claim": "not safe", "label": "true", "score": 65.0},)}
    )
    assert tier2["accepted"] is False
    assert tier2["contradictions"] == ("not safe",)
    assert tier2["score"] < 100


def test_reality_packet_and_judicial_logic_have_expected_keys() -> None:
    psl = PremiseStructureLayer().structure(PASSAGE)
    cdg = CausalDirectedGraph(psl["claims"])
    tier2: TierTwoResult = {"accepted": True, "contradictions": (), "score": 100.0}
    packet = RealityPacketBuilder().build(psl, cdg, tier2, consensus_score=77.0)
    judicial = JudicialLogic().deliberate(tier2, packet)

    assert set(packet.keys()) == {"version", "claims", "graph", "consensus_score", "adjudicated"}
    assert tuple(judicial.keys()) == JudicialLogic.REQUIRED_KEYS
    assert judicial["verdict"] == "accepted"
    assert packet["graph"]["nodes"][1] == "It never calls external APIs"


def test_rwl_and_consensus_are_deterministic() -> None:
    witnesses: list[Witness] = [
        {"name": "observer-b", "reliability": 0.72},
        {"name": "observer-a", "reliability": 0.72},
        {"name": "primary", "reliability": 0.92},
    ]
    rwl = ReliableWitnessLocator()
    selected = rwl.select(witnesses)
    consensus = ConsensusComputer().score(
        {"alpha": ({"model": "alpha", "score": 80.0, "claim": "x", "label": "true"},)}, selected
    )

    assert selected["name"] == "primary"
    assert 0.0 <= consensus <= 100.0


def test_final_output_json_has_required_fields() -> None:
    engine = RyuzenEngine()
    snapshot = engine.execute(PASSAGE, witnesses=[{"name": "primary", "reliability": 0.9}])
    payload = snapshot.as_dict()

    assert set(payload.keys()) == {
        "psl",
        "tier1",
        "tier2",
        "reality_packet",
        "judicial",
        "consensus_score",
        "execution_plan",
        "timestamp",
    }
    assert payload["reality_packet"]["consensus_score"] == payload["consensus_score"]
    assert json.loads(json.dumps(payload))["execution_plan"]["stages"] == list(snapshot.execution_plan.stages)
