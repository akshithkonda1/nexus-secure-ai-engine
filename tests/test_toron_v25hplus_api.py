from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
import sys

from fastapi.testclient import TestClient

root_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_path))
sys.path.insert(1, str(root_path / "src"))

from backend.toron_v25hplus.store import store
from backend.server import app
from ryuzen.toron_v25hplus.engine import (
    CausalDirectedGraph,
    DeterministicCache,
    Premise,
    PremiseStructureLayer,
    ReliableWitnessLocator,
    RyuzenEngine,
    StateSnapshot,
    TierTwoValidator,
)
from ryuzen.toron_v25hplus.mal import ModelAssuranceLayer
from ryuzen.toron_v25hplus.sim_suite import run_suite
from ryuzen.toron_v25hplus.telemetry_stub import telemetry_buffer


client = TestClient(app)


class _DummyDetector:
    def find_disagreements(self, claims):
        return ([], 0.0)


class _DummyMMRE:
    def evaluate_claims(self, claims):
        return SimpleNamespace(
            verified_facts=list(claims), conflicts_detected=[], evidence_density=1.0, escalation_required=False
        )


def setup_function() -> None:  # type: ignore[override]
    store.reset()


def test_sim_run_creates_history():
    response = client.post("/tests/sim/run", json={"scenario": "unit-path"})
    assert response.status_code == 200
    run_id = response.json()["run_id"]

    history = client.get("/tests/history").json()
    assert any(entry["run_id"] == run_id for entry in history)


def test_snapshots_round_trip():
    run_response = client.post("/tests/sim/run", json={"scenario": "snapshot-case"})
    snapshot_id = run_response.json()["snapshot_id"]

    snapshot = client.get(f"/tests/snapshot/{snapshot_id}")
    assert snapshot.status_code == 200

    diff = client.post(
        "/tests/snapshot/diff",
        json={"source_id": snapshot_id, "target_id": snapshot_id},
    ).json()
    assert diff["source"]["snapshot_id"] == snapshot_id
    assert diff["delta"]["changes"]


def test_load_metrics_present():
    run_response = client.post(
        "/tests/load/run",
        json={"profile": "smoke", "duration_seconds": 30, "virtual_users": 5},
    )
    run_id = run_response.json()["run_id"]

    metrics = client.get(f"/metrics/load/{run_id}")
    assert metrics.status_code == 200
    assert metrics.json()["run_id"] == run_id


def test_engine_snapshot_round_trip():
    engine = RyuzenEngine(semantic_detector=_DummyDetector(), mmre_engine=_DummyMMRE())
    snapshot: StateSnapshot = engine.execute("not safe but maybe acceptable.", [{"name": "qa", "reliability": 0.9}])

    payload = snapshot.as_dict()
    assert payload["psl"]["token_count"] > 0
    assert payload["execution_plan"]["version"] == "v2.5H+"


def test_validator_contradiction_detection():
    validator = TierTwoValidator(detector=_DummyDetector())
    result = validator.evaluate({"demo": ({"model": "demo", "claim": "not allowed", "label": "true", "score": 99.0},)})
    assert not result["accepted"]


def test_mal_and_telemetry_stubs():
    mal = ModelAssuranceLayer()
    latency = mal.generate_latency("signature")
    fingerprint = mal.fingerprint("payload")
    mal.record_api_call()

    telemetry_buffer.record("latency", float(latency))
    quarantine = telemetry_buffer.quarantine("investigate", ["latency"])
    scrub = telemetry_buffer.scrub()

    assert latency > 0
    assert fingerprint
    assert quarantine["count"] >= 0
    assert scrub["cleared"] >= 0
    assert mal.token_count("one two three") == 3
    assert mal.cached_latencies() >= 1
    assert mal.cached_fingerprints() >= 1


def test_sim_suite_helper():
    result = run_suite()
    assert result["count"] == len(result["results"])


def test_structure_and_graph_edges():
    layer = PremiseStructureLayer()
    structured = layer.structure("never skip tests. always document.")
    fallback = layer._build_structure("plain statement")
    cache: DeterministicCache[str] = DeterministicCache()
    assert cache.get_or_create("k", lambda: "v") == "v"

    graph = CausalDirectedGraph(structured["claims"])
    assert graph.edges

    locator = ReliableWitnessLocator()
    assert locator.select([])["name"] == "synthetic"
    assert any(p.label == "false" for p in structured["claims"])
    assert any(p.label == "true" for p in fallback["claims"])
