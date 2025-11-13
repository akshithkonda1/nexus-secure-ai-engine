from __future__ import annotations

from nexus.telemetry import TelemetryEvent, sort_telemetry_by_model


def test_sort_telemetry_by_model_groups_and_orders_events() -> None:
    event_one = TelemetryEvent(
        request_id="req-1",
        session_id="sess-1",
        models=["model-b", "model-a"],
        latencies={"model-a": 120.0, "model-b": 50.0},
        disagreement=0.25,
    )
    event_two = TelemetryEvent(
        request_id="req-2",
        session_id="sess-2",
        models=["model-c"],
        latencies={"model-c": 10},
        errors={"model-c": "timeout"},
        extra={"debate_rounds": 2},
    )

    grouped = sort_telemetry_by_model([event_one, event_two])

    assert list(grouped) == ["model-a", "model-b", "model-c"]
    assert grouped["model-a"][0]["latency"] == 120.0
    assert grouped["model-a"][0]["request_id"] == "req-1"
    assert grouped["model-b"][0]["latency"] == 50.0
    assert grouped["model-b"][0]["disagreement"] == 0.25
    assert grouped["model-c"][0]["latency"] == 10.0
    assert grouped["model-c"][0]["error"] == "timeout"
    assert grouped["model-c"][0]["extra"] == {"debate_rounds": 2}


def test_sort_telemetry_by_model_accepts_mapping_payloads() -> None:
    raw_payload = {
        "request_id": "req-3",
        "session_id": "sess-3",
        "models": ("model-a",),
        "latencies": {"model-a": "5.5"},
    }

    grouped = sort_telemetry_by_model([raw_payload])

    assert grouped["model-a"][0]["latency"] == 5.5
    assert grouped["model-a"][0]["model"] == "model-a"
