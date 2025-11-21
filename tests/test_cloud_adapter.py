"""Validate cloud adapter endpoint resolution."""

import pytest

from toron.cloud_adapter import CloudProviderAdapter


def test_resolves_default_providers(cloud_adapter):
    """Adapter should resolve the three default endpoints."""

    assert cloud_adapter.resolve("aws").startswith("https://")
    assert cloud_adapter.resolve("azure").endswith("openai")
    assert cloud_adapter.resolve("gcp").endswith("googleapis.com")


def test_override_and_unknown_provider():
    """Overrides should be stored and unknown providers rejected."""

    adapter = CloudProviderAdapter()
    adapter.set_override("aws", "https://example.com/custom")
    assert adapter.resolve("aws") == "https://example.com/custom"
    with pytest.raises(KeyError):
        adapter.resolve("digitalocean")
