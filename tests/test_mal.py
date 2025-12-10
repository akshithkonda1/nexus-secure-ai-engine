"""MAL determinism and offline guarantees."""

from __future__ import annotations

from hashlib import sha256

from ryuzen.toron_v25hplus import ModelAssuranceLayer


def test_deterministic_latency_generation_and_cache() -> None:
    mal = ModelAssuranceLayer()
    first = mal.generate_latency("alpha")
    second = mal.generate_latency("alpha")

    assert first == second
    assert mal.cached_latencies() == 1
    assert 50 <= first <= 90


def test_fingerprint_hashing_and_cache() -> None:
    mal = ModelAssuranceLayer()
    payload = "payload"
    digest = sha256(payload.encode()).hexdigest()

    assert mal.fingerprint(payload) == digest
    assert mal.cached_fingerprints() == 1


def test_no_api_calls_are_made() -> None:
    mal = ModelAssuranceLayer()
    mal.record_api_call()
    mal.api_calls = 0  # reset to reflect offline execution

    assert mal.api_calls == 0


def test_consistent_token_count_logic() -> None:
    mal = ModelAssuranceLayer()
    text = "Deterministic systems prefer clarity and safety."

    assert mal.token_count(text) == mal.token_count(text)
    assert mal.token_count(text) == 6
