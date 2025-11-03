"""Request middleware for abuse guard logging."""
from __future__ import annotations

from datetime import datetime, timezone
from flask import Flask, Request, request


def _resolve_client_ip(flask_request: Request) -> str | None:
    """Resolve the most likely client IP using forwarded headers."""

    forwarded_for = flask_request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return flask_request.remote_addr


def register_abuse_guard(app: Flask, redis_client, threshold: int = 500) -> None:
    """Register a soft abuse guard that logs excessive hourly traffic per IP."""

    window_seconds = 3600

    @app.before_request
    def _track_abuse() -> None:
        ip_address = _resolve_client_ip(request)
        if not ip_address:
            return

        now = datetime.now(timezone.utc)
        key = f"abuse:{ip_address}:{now.strftime('%Y%m%d%H')}"
        request_count = redis_client.incr(key)
        if request_count == 1:
            redis_client.expire(key, window_seconds)

        if request_count > threshold:
            app.logger.warning(
                "High request volume detected", extra={"ip": ip_address, "count": request_count}
            )


__all__ = ["register_abuse_guard"]
