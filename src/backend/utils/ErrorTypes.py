"""Custom error types for the Ryuzen platform security and sanitization layers."""

class EngineError(Exception):
    """Base engine error."""


class ProviderError(Exception):
    """Errors raised when upstream providers fail."""


class SecurityError(Exception):
    """Errors related to cryptography, integrity, or access control."""


class SanitizationError(Exception):
    """Errors raised during sanitization or PII removal."""


class RateLimitError(Exception):
    """Raised when rate limits are exceeded."""
