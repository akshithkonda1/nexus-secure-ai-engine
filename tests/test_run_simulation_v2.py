from nexus.ai.run_simulation import run_simulation


def test_run_simulation_smoke():
    summary = run_simulation(prompts=["Water is wet."])
    assert "avg_model_latency" in summary
    assert "avg_search_latency" in summary
    assert summary["runtime_seconds"] >= 0
