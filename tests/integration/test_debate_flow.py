from __future__ import annotations

import importlib
import pathlib
import sys
from types import SimpleNamespace
from typing import Any

import pytest

from tests.test_flask_app import _set_base_env

MODULE_PATH = pathlib.Path(__file__).resolve().parents[1] / "nexus" / "ai" / "nexus_flask_app.py"


def _load_flask_module(monkeypatch: pytest.MonkeyPatch):
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
    _set_base_env(monkeypatch, DummyResolver, request_bytes=1024)

    for name in ("nexus.ai.nexus_flask_app", "nexus.ai.bootstrap"):
        sys.modules.pop(name, None)
    module = importlib.import_module("nexus.ai.nexus_flask_app")
    importlib.reload(module)
    return module


class _DummyRedisClient:
    def __init__(self) -> None:
        self._hashes: dict[str, dict[str, float]] = {}
        self._values: dict[str, int] = {}

    def hmget(self, key: str, *fields: str) -> list[Any]:
        bucket = self._hashes.get(key, {})
        return [bucket.get(field) for field in fields]

    def hmset(self, key: str, mapping: dict[str, Any]) -> None:  # pragma: no cover - shim
        bucket = self._hashes.setdefault(key, {})
        for field, value in mapping.items():
            try:
                bucket[field] = float(value)
            except (TypeError, ValueError):
                bucket[field] = 0.0

    def expire(self, key: str, _ttl: int) -> None:  # pragma: no cover - shim
        self._hashes.setdefault(key, {})
        self._values.setdefault(key, 0)

    def incr(self, key: str) -> int:
        value = self._values.get(key, 0) + 1
        self._values[key] = value
        return value

    def decr(self, key: str) -> int:
        value = self._values.get(key, 0) - 1
        if value < 0:
            value = 0
        self._values[key] = value
        return value


@pytest.fixture
def debate_client(monkeypatch: pytest.MonkeyPatch):
    module = _load_flask_module(monkeypatch)
    redis_client = _DummyRedisClient()
    monkeypatch.setattr(
        "nexus.qos.redis.Redis.from_url", lambda *_args, **_kwargs: redis_client
    )

    monkeypatch.setattr(module, "log_event", lambda *args, **kwargs: None)
    monkeypatch.setattr(module, "_audit_put", lambda payload: None)

    stub_result = {
        "status": "ok",
        "answer": "Stub answer",
        "pii_detected": False,
        "pii_details": [],
        "models_used": ["stub-model"],
        "timings": {"stub-model": 0.01},
        "meta": {"schema_version": "test", "request_id": "stub"},
    }

    class _EngineStub:
        def __init__(self) -> None:
            self.calls: list[SimpleNamespace] = []

        def run(self, *args: Any, **kwargs: Any) -> dict[str, Any]:
            self.calls.append(SimpleNamespace(args=args, kwargs=kwargs))
            return stub_result

    engine_stub = _EngineStub()
    monkeypatch.setattr(module, "engine", engine_stub)

    client = module.app.test_client()
    client.engine_stub = engine_stub  # type: ignore[attr-defined]
    return client


def _authorized_headers() -> dict[str, str]:
    return {"X-API-Key": "test-key"}


def test_debate_happy_path_returns_answer_and_metadata(debate_client):
    resp = debate_client.post(
        "/debate",
        json={"prompt": "Hello", "models": ["model-a"]},
        headers=_authorized_headers(),
    )

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["answer"] == "Stub answer"
    assert body["status"] == "ok"
    assert isinstance(body.get("meta"), dict)
    assert body["meta"].get("schema_version") == "test"


def test_missing_prompt_is_rejected(debate_client):
    resp = debate_client.post(
        "/debate",
        json={"models": ["model-a"]},
        headers=_authorized_headers(),
    )

    assert resp.status_code == 400
    assert resp.get_json()["error"] == "Prompt is required"


def test_payload_exceeding_size_limit_returns_413(debate_client):
    oversized_prompt = "x" * 2000
    resp = debate_client.post(
        "/debate",
        json={"prompt": oversized_prompt},
        headers=_authorized_headers(),
    )

    assert resp.status_code == 413
    assert resp.get_json()["error"] == "Request too large"


def test_requesting_too_many_models_returns_400(debate_client):
    from nexus.ai.nexus_engine import MAX_MODELS_PER_REQUEST

    excessive_models = [f"model-{i}" for i in range(MAX_MODELS_PER_REQUEST + 1)]
    resp = debate_client.post(
        "/debate",
        json={"prompt": "Hello", "models": excessive_models},
        headers=_authorized_headers(),
    )

    assert resp.status_code == 400
    payload = resp.get_json()
    assert payload["error"] == "Too many models requested"
    assert payload["max_models"] == MAX_MODELS_PER_REQUEST
