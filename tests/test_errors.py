"""Unit tests for the structured Toron exception hierarchy."""

from toron.errors import (
    ConfigurationError,
    ErrorCategory,
    ErrorSeverity,
    ProviderError,
    RateLimitError,
    TimeoutError,
    ValidationError,
)


def test_validation_error_to_dict_contains_metadata():
    err = ValidationError("missing prompt", details={"field": "prompt"})
    payload = err.to_dict()

    assert payload["error"]["code"] == "VALIDATION_ERROR"
    assert payload["error"]["category"] == ErrorCategory.VALIDATION.value
    assert payload["error"]["severity"] == ErrorSeverity.MEDIUM.value
    assert payload["error"]["details"]["field"] == "prompt"


def test_provider_error_includes_provider_and_retry_hint():
    err = ProviderError("openai", "gateway timeout")
    payload = err.to_dict()

    assert "openai" in str(err)
    assert payload["error"]["code"] == "PROVIDER_ERROR"
    assert payload["error"]["retry_after"] == 30


def test_timeout_error_sets_operation_details():
    err = TimeoutError("vertex inference", timeout=15)
    payload = err.to_dict()

    assert "vertex inference" in err.message
    assert payload["error"]["details"]["timeout"] == 15


def test_rate_limit_error_user_message_has_retry():
    err = RateLimitError(limit=10, window=60, retry_after=12)
    assert "Rate limit" in err.user_message
    assert err.retry_after == 12


def test_configuration_error_defaults_to_critical():
    err = ConfigurationError("missing api key")
    assert err.severity is ErrorSeverity.CRITICAL
