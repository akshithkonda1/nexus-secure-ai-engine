"""Telemetry stub ensures PII is removed before logging."""

from __future__ import annotations

from sim.telemetry_stub import TelemetryPIISanitizer


def test_scrub_text_masks_email_and_phone() -> None:
    sanitizer = TelemetryPIISanitizer()
    text = "Contact alice@example.com or +12-345-6789 for details."
    scrubbed = sanitizer.scrub_text(text)

    assert "alice@example.com" not in scrubbed
    assert "+12-345-6789" not in scrubbed
    assert scrubbed.count("[redacted]") >= 2


def test_scrub_payload_is_idempotent() -> None:
    sanitizer = TelemetryPIISanitizer()
    payload = {"user": "bob@example.com", "note": "No PII"}

    first = sanitizer.scrub_payload(payload)
    second = sanitizer.scrub_payload(first)

    assert first == second
