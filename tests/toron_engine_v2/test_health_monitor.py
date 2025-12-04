"""
Tests for HealthMonitor circuit breaker behavior.
"""

import time

from src.backend.core.toron.engine_v2.core.health_monitor import HealthMonitor


def test_health_monitor_trips_circuit():
    hm = HealthMonitor(["openai"], failure_threshold=2, cooldown_seconds=60)

    assert hm.can_use("openai") is True

    hm.mark_failure("openai", reason="timeout")
    assert hm.can_use("openai") is True  # not tripped yet

    hm.mark_failure("openai", reason="error")
    assert hm.can_use("openai") is False  # now tripped

    snap = hm.snapshot()
    assert snap["openai"]["healthy"] is False
    assert snap["openai"]["failures"] == 2
    assert snap["openai"]["down_until"] > time.time()


def test_health_monitor_recovers_after_success():
    hm = HealthMonitor(["aws-bedrock"], failure_threshold=1, cooldown_seconds=60)

    hm.mark_failure("aws-bedrock", reason="boom")
    assert hm.can_use("aws-bedrock") is False

    hm.mark_success("aws-bedrock")
    assert hm.can_use("aws-bedrock") is True

    snap = hm.snapshot()
    assert snap["aws-bedrock"]["failures"] == 0
    assert snap["aws-bedrock"]["healthy"] is True
