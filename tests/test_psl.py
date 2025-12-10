"""Premise Structure Layer unit coverage."""

from __future__ import annotations

from ryuzen.toron_v25hplus import PremiseStructureLayer


PASSAGE = "Truthful systems are predictable. Uncertain paths maybe falter. Never rely on chance."


def test_claims_are_extracted_and_labeled() -> None:
    psl = PremiseStructureLayer().structure(PASSAGE)
    labels = [premise.label for premise in psl["claims"]]

    assert labels == ["true", "uncertain", "false"]
    assert all(premise.text for premise in psl["claims"])


def test_caching_behavior_is_stable() -> None:
    layer = PremiseStructureLayer()
    first = layer.structure(PASSAGE)
    second = layer.structure(PASSAGE)

    assert first is second
    assert len(first["claims"]) == len(second["claims"])
