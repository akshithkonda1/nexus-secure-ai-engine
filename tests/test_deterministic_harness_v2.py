import os
from pathlib import Path

from nexus.ai.deterministic_harness import DeterministicHarness


def test_harness_creates_output_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("SIM_MODE", "true")
    harness = DeterministicHarness()
    snapshot = harness.snapshot()

    assert snapshot["run_id"].startswith("sim-")
    assert Path(snapshot["output_dir"]).exists()
    assert harness.context.model_order == ("alpha", "beta", "gamma")
