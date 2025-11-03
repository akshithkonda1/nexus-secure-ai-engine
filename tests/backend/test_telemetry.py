from __future__ import annotations

import json
import sqlite3

from backend.telemetry import TELEMETRY_QUEUE_KEY


def test_telemetry_logs_and_persists(client, redis_client, app, tmp_path):
    payload = {
        "query_hash": "abc123",
        "scores": [0.8, 0.9],
        "duration_ms": 1200,
        "opt_in": True,
    }
    response = client.post("/api/telemetry", json=payload)
    assert response.status_code == 200
    assert response.json["status"] == "logged"
    assert redis_client.get(TELEMETRY_QUEUE_KEY)[0].startswith("{")

    connection = sqlite3.connect(app.config["TELEMETRY_DB_PATH"])
    cursor = connection.execute("SELECT query_hash, scores_json, duration_ms, opt_in FROM telemetry")
    row = cursor.fetchone()
    assert row[0] == "abc123"
    assert json.loads(row[1]) == [0.8, 0.9]
    assert row[2] == 1200
    assert row[3] == 1


def test_telemetry_hashes_when_missing(client, redis_client):
    payload = {
        "scores": [0.5],
        "duration_ms": 10,
        "opt_in": False,
    }
    response = client.post("/api/telemetry", json=payload)
    assert response.status_code == 200
    body = response.get_json()
    assert len(body["query_hash"]) == 64
    assert redis_client.get(TELEMETRY_QUEUE_KEY)[0].startswith("{\"query_hash\"")


def test_telemetry_validation_failure(client):
    payload = {
        "scores": [],
        "duration_ms": -1,
        "opt_in": True,
    }
    response = client.post("/api/telemetry", json=payload)
    assert response.status_code == 400
    assert response.json["error"] == "invalid_payload"
