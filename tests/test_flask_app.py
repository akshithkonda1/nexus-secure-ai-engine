# mypy: ignore-errors

import base64
import importlib
import json
import pathlib
import sys
import types
from typing import Any

import pytest

MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "nexus" / "ai" / "nexus_flask_app.py"


@pytest.fixture
def flask_loader(monkeypatch):
    module_dir = str(MODULE_PATH.parent)
    if module_dir not in sys.path:
        sys.path.insert(0, module_dir)

    importlib.import_module("nexus.ai")
    nexus_config = importlib.import_module("nexus.ai.nexus_config")

    class DummyResolver:
        store: dict[str, str] = {}
        last_init: dict[str, Any] | None = None

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
        module = importlib.import_module("nexus.ai.nexus_flask_app")
        importlib.reload(module)
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
            },
        ],
    }
    monkeypatch.setenv("AUTHORIZED_API_KEYS", "test-key")
    monkeypatch.setenv("TRUSTED_ORIGINS", "https://example.com")
    monkeypatch.setenv("NEXUS_MODELS_JSON", json.dumps(catalog))
    monkeypatch.setenv("NEXUS_ALLOW_TEST_FALLBACKS", "1")
    monkeypatch.setenv("NEXUS_HEALTH_ENABLE", "0")
    monkeypatch.setenv("NEXUS_ENFORCE_HTTPS", "0")
    monkeypatch.setenv("NEXUS_ALLOW_ALL_MODELS", "1")
    monkeypatch.setenv("NEXUS_TENANT_ID", "tenant-test")
    monkeypatch.setenv("NEXUS_INSTANCE_ID", "instance-test")
    monkeypatch.setenv("NEXUS_DEFAULT_USER_ID", "user-test")
    monkeypatch.setenv("NEXUS_RATE_LIMIT_STORAGE_URL", "memory://")
    monkeypatch.setenv("NEXUS_RATE_LIMITS", "100/minute, 1000/day")
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
    assert module.app.config["NEXUS_GATEWAY_SETTINGS"].rate_limits == ("100/minute", "1000/day")


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


def test_production_requires_rate_limit_storage(monkeypatch, flask_loader):
    _set_base_env(monkeypatch, flask_loader.resolver_class)
    monkeypatch.setenv("NEXUS_ENV", "prod")
    monkeypatch.setenv("NEXUS_RATE_LIMIT_STORAGE_URL", "memory://")

    with pytest.raises(Exception) as excinfo:
        flask_loader()

    assert excinfo.type.__name__ == "AppInitializationError"
    assert "NEXUS_RATE_LIMIT_STORAGE_URL" in str(excinfo.value)


def test_healthz_sets_request_id(monkeypatch, flask_loader):
    _set_base_env(monkeypatch, flask_loader.resolver_class)
    module = flask_loader()
    client = module.app.test_client()

    resp = client.get("/healthz")
    assert resp.status_code == 200
    generated_rid = resp.headers.get("X-Request-ID")
    assert generated_rid is not None and len(generated_rid) == 32

    resp = client.get("/healthz", headers={"X-Request-ID": "abc123"})
    assert resp.status_code == 200
    assert resp.headers.get("X-Request-ID") == "abc123"


def test_readyz_reports_ok(monkeypatch, flask_loader):
    _set_base_env(monkeypatch, flask_loader.resolver_class)
    module = flask_loader()
    module.connectors = {"stub": types.SimpleNamespace(health_check=lambda: False)}  # type: ignore[attr-defined]
    client = module.app.test_client()

    resp = client.get("/readyz")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["status"] == "ok"


def test_security_headers_applied(monkeypatch, flask_loader):
    _set_base_env(monkeypatch, flask_loader.resolver_class)
    module = flask_loader()
    client = module.app.test_client()

    resp = client.get("/healthz")
    assert resp.status_code == 200
    assert resp.headers["Strict-Transport-Security"].startswith("max-age=63072000")
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    policy = resp.headers["Permissions-Policy"]
    for directive in ("geolocation=()", "microphone=()", "camera=()"):
        assert directive in policy


def test_metrics_endpoint(monkeypatch, flask_loader):
    _set_base_env(monkeypatch, flask_loader.resolver_class)
    module = flask_loader()
    client = module.app.test_client()

    resp = client.get("/metrics")
    assert resp.status_code == 200
    assert resp.mimetype == "text/plain"
