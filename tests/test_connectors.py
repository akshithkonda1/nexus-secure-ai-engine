"""Verify connector registry metadata."""

from toron.connectors import Connector, ConnectorRegistry


def test_registry_contains_default_connectors(connector_registry):
    """The default registry should expose three cloud providers."""

    metadata = connector_registry.list_metadata()
    providers = {entry["provider"] for entry in metadata}
    assert providers == {"aws", "azure", "gcp"}


def test_register_and_retrieve_connector():
    """Custom connectors should be discoverable by name."""

    registry = ConnectorRegistry()
    connector = Connector(name="local-mock", source="local", version="1.0", metadata={"status": "active"})
    registry.register(connector)
    assert registry.get("local-mock").metadata["status"] == "active"
