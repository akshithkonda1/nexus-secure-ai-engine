import json

from fastapi.testclient import TestClient

from src.backend.api.server import app
from src.backend.security.aes256_engine import AES256Engine

client = TestClient(app)


def test_health_route():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json().get("status") == "ok"


def test_ask_round_trip():
    crypto: AES256Engine = app.state.aes_engine
    payload = {"prompt": "hello"}
    encrypted = crypto.encrypt(json.dumps(payload))
    response = client.post("/api/v1/ask", json={"payload": encrypted})
    assert response.status_code == 200
    decrypted = crypto.decrypt(response.json()["payload"])
    assert "hello" in decrypted


def test_models_route():
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    body = response.json()
    assert "models" in body
    assert isinstance(body["models"], list)
