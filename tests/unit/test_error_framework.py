from __future__ import annotations

import traceback
from typing import Any

import pytest


class ToronException(Exception):
    category: str = "unknown"
    severity: str = "info"

    def __init__(self, message: str, category: str | None = None, severity: str | None = None):
        super().__init__(message)
        self.message = message
        self.category = category or self.category
        self.severity = severity or self.severity
        self.stack = traceback.format_stack()

    def to_dict(self) -> dict[str, Any]:
        return {
            "message": self.message,
            "category": self.category,
            "severity": self.severity,
            "stack": self.stack,
        }


class ProviderException(ToronException):
    category = "provider"
    severity = "error"


class ValidationException(ToronException):
    category = "validation"
    severity = "warning"


def test_exception_hierarchy():
    exc = ProviderException("provider failed")
    assert isinstance(exc, ToronException)
    assert exc.category == "provider"
    assert exc.severity == "error"


def test_to_dict_contains_stack_trace():
    exc = ValidationException("bad request")
    payload = exc.to_dict()
    assert payload["category"] == "validation"
    assert payload["severity"] == "warning"
    assert isinstance(payload["stack"], list)
    assert any("test_to_dict_contains_stack_trace" in frame for frame in payload["stack"])


def test_category_and_severity_override():
    exc = ToronException("custom", category="runtime", severity="critical")
    payload = exc.to_dict()
    assert payload["category"] == "runtime"
    assert payload["severity"] == "critical"


def test_serialization_round_trip():
    exc = ProviderException("wrapped failure")
    serialized = exc.to_dict()
    assert serialized["message"] == "wrapped failure"
    assert serialized["category"] == "provider"
    assert serialized["severity"] == "error"
    assert len(serialized["stack"]) > 0
