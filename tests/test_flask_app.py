import base64
import importlib
import importlib.util
import json
import pathlib
import sys
import types

import pytest

from typing import Any, Dict

MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "nexus.ai" / "nexus_flask_app.py"


@pytest.fixture
def flask_loader(monkeypatch):
    module_dir = str(MODULE_PATH.parent)
    if module_dir not in sys.path:
        sys.path.insert(0, module_dir)

    sys.modules.setdefault("nexus", types.ModuleType("nexus"))
    pkg = sys.modules.setdefault("nexus.ai", types.ModuleType("nexus.ai"))
    if not hasattr(pkg, "__path__"):
        pkg.__path__ = [module_dir]

    nexus_config = importlib.import_module("nexus_config")

    class DummyResolver:
        store: Dict[str, str] = {}
        last_init: Dict[str, Any] | None = None

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
            if key in self.overrides:
                return self.overrides[key]
            return DummyResolver.store.get(key)

    monkeypatch.setattr(nexus_config, "SecretResolver", DummyResolver, raising=False)

    def _load():
        for name in ("nexus.ai.nexus_flask_app", "nexus.ai.bootstrap"):
            sys.modules.pop(name, None)
        spec = importlib.util.spec_from_file_location("nexus.ai.nexus_flask_app", MODULE_PATH)
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        assert spec.loader is not None
        spec.loader.exec_module(module)
        return module

    _load.resolver_class = DummyResolver  # type: ignore[attr-defined]

    return _load


def _set_base_env(monkeypatch, resolver_cls, *, request_bytes=None):
    catalog = {
        "defaults": {"timeout": 1, "max_retries": 1},
        "models": [
            {
                "name": "stub",
                "endpoint": "https://example.com/api",
                "auth": {"type": "bearer", "value": "token"},
            }
        ],
    }
    monkeypatch.setenv("AUTHORIZED_API_KEYS", "test-key")
    monkeypatch.setenv("TRUSTED_ORIGINS", "https://example.com")
    monkeypatch.setenv("NEXUS_MODELS_JSON", json.dumps(catalog))
    monkeypatch.setenv("NEXUS_ALLOW_TEST_FALLBACKS", "1")
    monkeypatch.setenv("NEXUS_HEALTH_ENABLE", "0")
    monkeypatch.setenv("NEXUS_ALLOW_ALL_MODELS", "1")
    monkeypatch.setenv("NEXUS_TENANT_ID", "tenant-test")
    monkeypatch.setenv("NEXUS_INSTANCE_ID", "instance-test")
    monkeypatch.setenv("NEXUS_DEFAULT_USER_ID", "user-test")
    if request_bytes is not None:
        monkeypatch.setenv("NEXUS_MAX_REQUEST_BYTES", str(request_bytes))
    else:
        monkeypatch.delenv("NEXUS_MAX_REQUEST_BYTES", raising=False)

    resolver_cls.store = {
        "NEXUS_DATA_KEY_B64": base64.b64encode(b"0" * 32).decode("ascii"),
    }


def test_app_initialization_populates_config(monkeypatch, flask_loader):
    _set_base_env(monkeypatch, flask_loader.resolver_class, request_bytes=4096)
    module = flask_loader()

    assert module.MAX_REQUEST_BYTES == 4096
    assert module.app.config["NEXUS_ENGINE"] is module.engine
    assert module.app.config["NEXUS_MEMORY"] is module.memory
    assert module.app.config["NEXUS_GATEWAY_SETTINGS"].api_keys == ("test-key",)


def test_missing_api_keys_raises(monkeypatch, flask_loader):
    _set_base_env(monkeypatch, flask_loader.resolver_class)
    monkeypatch.delenv("AUTHORIZED_API_KEYS", raising=False)

    with pytest.raises(Exception) as excinfo:
        flask_loader()
    assert excinfo.type.__name__ == "AppInitializationError"
    assert "AUTHORIZED_API_KEYS" in str(excinfo.value)


def test_rejects_non_https_origins(monkeypatch, flask_loader):
    _set_base_env(monkeypatch, flask_loader.resolver_class)
    monkeypatch.setenv("TRUSTED_ORIGINS", "http://insecure.local")

    with pytest.raises(Exception) as excinfo:
        flask_loader()
    assert excinfo.type.__name__ == "AppInitializationError"
    assert "https://" in str(excinfo.value)
