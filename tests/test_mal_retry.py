"""Retry logic coverage for the Model Assurance Layer."""

from __future__ import annotations

from ryuzen.toron_v25hplus import ModelAssuranceLayer


def test_retry_succeeds_after_budget() -> None:
    mal = ModelAssuranceLayer()
    result = mal.retry(signature="sig", failure_budget=1, max_attempts=3)

    assert result["status"] == "ok"
    assert result["attempts"] == 2
    assert len(result["latency_trace"]) == 2
    assert mal.api_calls == 2


def test_retry_respects_max_attempts() -> None:
    mal = ModelAssuranceLayer()
    result = mal.retry(signature="sig", failure_budget=5, max_attempts=2)

    assert result["status"] == "failed"
    assert result["attempts"] == 2
    assert len(result["latency_trace"]) == 2
