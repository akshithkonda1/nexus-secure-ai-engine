from nexus.ai.nexus_engine import Engine


def test_engine_runs_with_verification():
    engine = Engine(sim_mode=True)
    result = engine.run_with_verification("The Eiffel Tower is in Paris.")

    assert result["schema_version"] == engine.schema_version
    assert isinstance(result.get("model_outputs"), list)
    assert len(result.get("claims", [])) <= 10
    assert len(result.get("errors", [])) == 0
    assert "verified_claims" in result
