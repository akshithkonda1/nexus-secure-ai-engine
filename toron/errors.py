"""Structured exception hierarchy for Toron services.

This module provides production-ready exceptions with consistent
categorisation, severity levels, and serialisation helpers so that API
layers can surface actionable errors without leaking sensitive details.
"""

from __future__ import annotations

import time
import traceback
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, Optional


class ErrorSeverity(Enum):
    """Severity levels used for alerting and routing."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorCategory(Enum):
    """Logical category for downstream handling and analytics."""

    VALIDATION = "validation"
    PROVIDER = "provider"
    TIMEOUT = "timeout"
    RATE_LIMIT = "rate_limit"
    AUTHENTICATION = "authentication"
    CONFIGURATION = "configuration"
    INTERNAL = "internal"
    EXTERNAL = "external"


@dataclass
class ToronException(Exception):
    """Base exception carrying structured context.

    The class is dataclass-backed for predictable attributes and can be
    converted to a serialisable dictionary for HTTP responses or logging
    sinks. A minimal user-friendly message is exposed separately from the
    detailed message to avoid leaking implementation details.
    """

    message: str
    code: str
    category: ErrorCategory
    severity: ErrorSeverity
    details: Dict[str, Any] | None = None
    user_message: str | None = None
    retry_after: int | None = None
    cause: Exception | None = None

    def __post_init__(self) -> None:
        # Normalise defaults after dataclass initialisation
        self.details = self.details or {}
        self.user_message = self.user_message or self._generate_user_message()
        self.traceback_str = traceback.format_exc()
        super().__init__(self.message)

    def _generate_user_message(self) -> str:
        if self.category == ErrorCategory.PROVIDER:
            return "We're experiencing issues with our AI provider. Please try again."
        if self.category == ErrorCategory.TIMEOUT:
            return "Your request took longer than expected. Please try again."
        if self.category == ErrorCategory.RATE_LIMIT:
            retry_hint = f" Retry after {self.retry_after}s." if self.retry_after else ""
            return f"Rate limit exceeded.{retry_hint}".strip()
        if self.category == ErrorCategory.VALIDATION:
            return "The request was invalid. Please check your input and try again."
        return "An unexpected error occurred. Our team has been notified."

    def to_dict(self) -> Dict[str, Any]:
        """Render the exception into a serialisable error payload."""

        return {
            "error": {
                "message": self.user_message,
                "code": self.code,
                "category": self.category.value,
                "severity": self.severity.value,
                "details": self.details,
                "retry_after": self.retry_after,
                "timestamp": time.time(),
            }
        }


class ValidationError(ToronException):
    """Raised when incoming data fails validation checks."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            category=ErrorCategory.VALIDATION,
            severity=ErrorSeverity.MEDIUM,
            details=details,
        )


class ProviderError(ToronException):
    """Wrap unexpected provider failures with context."""

    def __init__(self, provider: str, message: str, cause: Optional[Exception] = None) -> None:
        super().__init__(
            message=f"{provider}: {message}",
            code="PROVIDER_ERROR",
            category=ErrorCategory.PROVIDER,
            severity=ErrorSeverity.HIGH,
            details={"provider": provider},
            cause=cause,
            retry_after=30,
        )


class TimeoutError(ToronException):
    """Raised when operations exceed an expected duration."""

    def __init__(self, operation: str, timeout: float) -> None:
        super().__init__(
            message=f"{operation} exceeded timeout of {timeout}s",
            code="TIMEOUT_ERROR",
            category=ErrorCategory.TIMEOUT,
            severity=ErrorSeverity.HIGH,
            details={"operation": operation, "timeout": timeout},
            retry_after=5,
        )


class RateLimitError(ToronException):
    """Communicate when usage exceeds configured thresholds."""

    def __init__(self, limit: int, window: int, retry_after: int) -> None:
        super().__init__(
            message=f"Rate limit of {limit} requests per {window}s exceeded",
            code="RATE_LIMIT_ERROR",
            category=ErrorCategory.RATE_LIMIT,
            severity=ErrorSeverity.MEDIUM,
            details={"limit": limit, "window": window},
            retry_after=retry_after,
        )


class ConfigurationError(ToronException):
    """Raised when required configuration is missing or invalid."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        super().__init__(
            message=message,
            code="CONFIGURATION_ERROR",
            category=ErrorCategory.CONFIGURATION,
            severity=ErrorSeverity.CRITICAL,
            details=details,
        )
