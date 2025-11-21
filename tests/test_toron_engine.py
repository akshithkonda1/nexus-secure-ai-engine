"""Integration-style test for Toron engine bootstrap."""

from toron import (
    CloudProviderAdapter,
    ConnectorRegistry,
    EngineConfig,
    PIIPipeline,
    Retriever,
    TokenBucket,
    ToronEngine,
)


def test_engine_bootstrap_manifest(fake_session, connector_registry, cloud_adapter):
    """Bootstrap output should include endpoints and connector metadata."""

    engine = ToronEngine(
        config=EngineConfig(host="127.0.0.1", port=8080),
        connectors=connector_registry,
        adapter=cloud_adapter,
        pii_pipeline=PIIPipeline(),
        retriever=Retriever(session=fake_session),
        rate_limiter=TokenBucket(capacity=10, fill_rate=5),
        metadata={"version": "1.6"},
    )

    manifest = engine.bootstrap()
    assert manifest["host"] == "127.0.0.1"
    assert len(manifest["connectors"]) == 3
    assert set(manifest["endpoints"].keys())
    assert manifest["metadata"]["version"] == "1.6"
