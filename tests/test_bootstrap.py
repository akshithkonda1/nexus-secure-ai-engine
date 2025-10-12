import importlib
import importlib.util
import json
import pathlib
import sys
from typing import Any, Dict

import pytest

MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "nexus.ai" / "bootstrap.py"


def _load_bootstrap():
    module_dir = str(MODULE_PATH.parent)
    if module_dir not in sys.path:
        sys.path.insert(0, module_dir)
    sys.modules.pop("nexus.ai.bootstrap", None)
    spec = importlib.util.spec_from_file_location("nexus.ai.bootstrap", MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def _bootstrap_with_stub(monkeypatch):
    module_dir = str(MODULE_PATH.parent)
    if module_dir not in sys.path:
        sys.path.insert(0, module_dir)

    nexus_config = importlib.import_module("nexus_config")
    if not hasattr(nexus_config, "SecretResolver"):

        class _PlaceholderResolver:
            def __init__(self, *_a, **_k):  # pragma: no cover - should be patched in tests
                raise RuntimeError("SecretResolver placeholder should be patched")

            def get(self, _key):  # pragma: no cover
                return None

        setattr(nexus_config, "SecretResolver", _PlaceholderResolver)

    bootstrap = _load_bootstrap()

    class DummyResolver:
        last_init: Dict[str, Any] | None = None
        store: Dict[str, Any] = {}

        def __init__(self, providers, overrides, ttl_seconds):
            DummyResolver.last_init = {
                "providers": providers,
                "overrides": overrides,
                "ttl": ttl_seconds,
            }
            self.providers = providers
            self.overrides = overrides
            self.ttl_seconds = ttl_seconds

        def get(self, key: str):
            return DummyResolver.store.get(key)

    monkeypatch.setattr(bootstrap, "SecretResolver", DummyResolver)
    monkeypatch.setattr(importlib.import_module("nexus_config"), "SecretResolver", DummyResolver)
    return bootstrap, DummyResolver


def test_make_connectors_from_env_json(monkeypatch):
    bootstrap, DummyResolver = _bootstrap_with_stub(monkeypatch)
    DummyResolver.store = {}

    monkeypatch.setenv("NEXUS_ALLOW_ALL_MODELS", "1")
    monkeypatch.setenv("NEXUS_SECRETS_PROVIDERS", "aws,azure,aws")
    monkeypatch.setenv("NEXUS_SECRET_TTL_SECONDS", "120")
    monkeypatch.delenv("NEXUS_SECRET_MODELS_JSON_FIELD", raising=False)
    monkeypatch.delenv("NEXUS_MODELS_PATH", raising=False)

    catalog = {
        "defaults": {"timeout": 4, "max_retries": 2, "adapter": "openai.chat"},
        "models": [
            {
                "name": "primary",
                "endpoint": "https://api.example.com/v1",
                "headers": {"X-Custom": "true"},
                "auth": {"type": "header", "header": "X-Token", "value": "static-token"},
            }
        ],
    }
    monkeypatch.setenv("NEXUS_MODELS_JSON", json.dumps(catalog))

    connectors = bootstrap.make_connectors()

    assert set(connectors.keys()) == {"primary"}
    primary = connectors["primary"]
    assert primary.headers["X-Token"] == "static-token"
    assert primary.headers["X-Custom"] == "true"

    assert DummyResolver.last_init is not None
    assert DummyResolver.last_init["providers"] == ["aws", "azure"]
    assert DummyResolver.last_init["ttl"] == 120


def test_secret_field_extraction(monkeypatch):
    bootstrap, DummyResolver = _bootstrap_with_stub(monkeypatch)
    DummyResolver.store = {
        "MODELS_JSON": {
            "data": {
                "defaults": {"timeout": 8},
                "models": [
                    {
                        "name": "secondary",
                        "endpoint": "https://api.other.com/v1",
                        "auth": {"type": "bearer", "secret": "SECONDARY_TOKEN"},
                    }
                ],
            }
        },
        "SECONDARY_TOKEN": "secret-value",
    }

    monkeypatch.setenv("NEXUS_ALLOW_ALL_MODELS", "1")
    monkeypatch.setenv("NEXUS_SECRET_MODELS_JSON_FIELD", "data")
    monkeypatch.delenv("NEXUS_MODELS_JSON", raising=False)
    monkeypatch.delenv("NEXUS_MODELS_PATH", raising=False)
    monkeypatch.delenv("NEXUS_SECRET_TTL_SECONDS", raising=False)

    connectors = bootstrap.make_connectors()
    assert "secondary" in connectors
    assert connectors["secondary"].headers["Authorization"] == "Bearer secret-value"


def test_invalid_ttl_raises(monkeypatch):
    bootstrap, DummyResolver = _bootstrap_with_stub(monkeypatch)
    DummyResolver.store = {}

    monkeypatch.setenv("NEXUS_ALLOW_ALL_MODELS", "1")
    monkeypatch.setenv("NEXUS_SECRET_TTL_SECONDS", "NaN")
    monkeypatch.setenv(
        "NEXUS_MODELS_JSON",
        json.dumps(
            {
                "models": [
                    {
                        "name": "bad",
                        "endpoint": "https://api.invalid.com",
                        "auth": {"type": "bearer", "value": "token"},
                    }
                ]
            }
        ),
    )

    with pytest.raises(bootstrap.BootstrapError):
        bootstrap.make_connectors()
