from nexus.telemetry import TelemetryEvent, sort_telemetry_by_model

def test_sort_telemetry_by_model_groups_and_orders_events() -> None:
    event_one = TelemetryEvent(
        model_name="model-a",
        latency_ms=120.0,
        disagreement=0.25,
        hallucination_score=0.05,
        token_usage=1200,
        debate_metadata={"rounds": 3},
    )
    event_two = TelemetryEvent(
        model_name="model-b",
        latency_ms=50,
        failure_type="timeout",
        disagreement=0.15,
        extra={"notes": "retry"},
    )
    event_three = TelemetryEvent(
        model_name="model-c",
        latency_ms=10.0,
    )

    grouped = sort_telemetry_by_model([event_one, event_two, event_three])

    assert list(grouped) == ["model-a", "model-b", "model-c"]
    assert grouped["model-a"][0]["latency_ms"] == 120.0
    assert grouped["model-a"][0]["hallucination_score"] == 0.05
    assert grouped["model-a"][0]["token_usage"] == 1200
    assert grouped["model-a"][0]["debate_metadata"] == {"rounds": 3}
    assert grouped["model-b"][0]["failure_type"] == "timeout"
    assert grouped["model-b"][0]["extra"] == {"notes": "retry"}
    assert grouped["model-c"][0]["latency_ms"] == 10.0


def test_sort_telemetry_by_model_accepts_mapping_payloads() -> None:
    raw_payload = {
        "model_name": "model-d",
        "latency_ms": "5.5",
        "token_usage": "42",
        "debate_metadata": {"rounds": 1},
    }

    grouped = sort_telemetry_by_model([raw_payload])

    assert grouped["model-d"][0]["latency_ms"] == 5.5
    assert grouped["model-d"][0]["token_usage"] == 42
    assert grouped["model-d"][0]["debate_metadata"] == {"rounds": 1}
