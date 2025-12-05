import pytest

from ryuzen.engine.simulation_mode import SimulationMode
from ryuzen.engine.toron_engine import ToronEngine
from ryuzen.enterprise.compliance.mock_compliance import MockComplianceSuite
from ryuzen.trust.mock_lineage import MockLineageTracker
from ryuzen.trust.mock_trust_layer import MockTrustLayer


@pytest.mark.asyncio
async def test_simulation_generate():
    SimulationMode.enable()

    engine = ToronEngine(
        trust_layer=MockTrustLayer(),
        lineage_tracker=MockLineageTracker(),
        compliance_suite=MockComplianceSuite(),
    )

    result = await engine.generate("Explain quantum entanglement.")
    print("Simulated output:", result.get("response"))

    assert result.get("consensus") is not None
    assert result.get("responses")
    assert result.get("response")
