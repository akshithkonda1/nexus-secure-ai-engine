from __future__ import annotations

from __future__ import annotations

import os

import pytest

from backend import create_app
from tests.backend.conftest import InMemoryRedis


class StaticClient:
    def __init__(self, name: str, response: str) -> None:
        self.name = name
        self._response = response

    def generate(self, prompt: str) -> str:  # noqa: D401
        return self._response


class FailingClient:
    def __init__(self, name: str, exc: Exception) -> None:
        self.name = name
        self._exc = exc

    def generate(self, prompt: str) -> str:  # noqa: D401
        raise self._exc


def test_debate_endpoint_idempotent(client, redis_client):
    payload = {"query": "Explain beta reliability"}
    first = client.post("/api/debate", json=payload)
    second = client.post("/api/debate", json=payload)
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json == second.json
    cache_key = f"debate:cache:{first.json['query_hash']}"
    assert redis_client.get(cache_key)


def test_debate_fallback_on_failure(tmp_path):
    redis_client = InMemoryRedis()
    os.environ["BETA_UNLIMITED"] = "true"
    os.environ["TELEMETRY_DB_PATH"] = str(tmp_path / "telemetry.db")
    app = create_app(
        redis_client=redis_client,
        llm_clients=[
            StaticClient("openai", "response a"),
            FailingClient("anthropic", RuntimeError("boom")),
            StaticClient("gemini", "response a"),
        ],
        limiter_storage_uri="memory://",
    )
    app.config.update(TESTING=True)
    with app.test_client() as client:
        response = client.post("/api/debate", json={"query": "hello"})
        assert response.status_code == 200
        body = response.get_json()
        assert len(body["responses"]) == 2
        assert all(item["score"] == pytest.approx(1.0) for item in body["responses"])


def test_debate_errors_when_less_than_two_models(tmp_path):
    redis_client = InMemoryRedis()
    os.environ["BETA_UNLIMITED"] = "true"
    os.environ["TELEMETRY_DB_PATH"] = str(tmp_path / "telemetry.db")
    app = create_app(
        redis_client=redis_client,
        llm_clients=[FailingClient("only", RuntimeError("fail"))],
        limiter_storage_uri="memory://",
    )
    app.config.update(TESTING=True)
    with app.test_client() as client:
        response = client.post("/api/debate", json={"query": "hello"})
        assert response.status_code == 502


def test_abuse_guard_logs_when_threshold_exceeded(client, caplog):
    caplog.clear()
    caplog.set_level("WARNING")
    for _ in range(0, 501):
        client.get("/health")
    warnings = [record for record in caplog.records if record.levelname == "WARNING"]
    assert warnings


def test_beta_logging(client, caplog):
    caplog.clear()
    response = client.post("/api/debate", json={"query": "Trace logging"})
    assert response.status_code == 200
    assert any("Beta mode" in record.message for record in caplog.records)
