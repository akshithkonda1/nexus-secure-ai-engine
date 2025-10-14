"""
Flask alpha bootstrap: health/ready endpoints, Prometheus metrics, size limits, timeouts,
and security headers. Import and call `wire_alpha(app)` in your Flask app factory.
"""

from __future__ import annotations

import logging
import time
from collections.abc import Callable
from functools import wraps
from typing import Any, TypeVar, cast

from flask import Response, current_app, jsonify, request

try:  # pragma: no cover - exercised via integration tests
    from prometheus_client import (
        CONTENT_TYPE_LATEST,
        CollectorRegistry,
        Counter,
        Histogram,
        generate_latest,
    )
except ModuleNotFoundError:  # pragma: no cover - lightweight fallback for offline envs
    CONTENT_TYPE_LATEST = "text/plain; version=0.0.4"

    class _NoopMetric:
        def __init__(self, *_args: Any, **_kwargs: Any) -> None:
            self._value = 0.0

        def labels(self, *_args: Any, **_kwargs: Any) -> "_NoopMetric":
            return self

        def inc(self, amount: float = 1.0) -> None:
            self._value += amount

        def observe(self, value: float) -> None:
            self._value = value

    def Counter(*_args: Any, **_kwargs: Any) -> _NoopMetric:  # type: ignore[misc]
        return _NoopMetric()

    def Histogram(*_args: Any, **_kwargs: Any) -> _NoopMetric:  # type: ignore[misc]
        return _NoopMetric()

    def generate_latest() -> bytes:
        return b"# metrics disabled\n"


LOG = logging.getLogger("nexus_alpha")
APP_START = time.time()

if "CollectorRegistry" in globals():
    PROM_REGISTRY = CollectorRegistry()
else:
    PROM_REGISTRY = None

REQ_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
    registry=PROM_REGISTRY,
)
REQ_LAT = Histogram(
    "http_request_duration_seconds",
    "Request duration (s)",
    ["endpoint"],
    registry=PROM_REGISTRY,
)

MAX_BODY_BYTES = 1_000_000  # 1 MB
REQUEST_TIMEOUT_S = 30  # app-level soft timeout (reserved for future use)

F = TypeVar("F", bound=Callable[..., Any])


def _security_headers(resp: Response) -> Response:
    resp.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer"
    resp.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return resp


def _alpha_token_required(fn: F) -> F:
    """Require X-Alpha-Token header when ALPHA_ACCESS_TOKEN is configured."""

    @wraps(fn)
    def _wrap(*args: Any, **kwargs: Any):
        token_cfg = current_app.config.get("ALPHA_ACCESS_TOKEN") or current_app.config.get(
            "alpha_access_token"
        )
        if token_cfg:
            hdr = request.headers.get("X-Alpha-Token")
            if not hdr or hdr != token_cfg:
                return jsonify({"error": "alpha access required"}), 401
        return fn(*args, **kwargs)

    return cast(F, _wrap)


def _instrument(fn: F) -> F:
    @wraps(fn)
    def _wrap(*args: Any, **kwargs: Any):
        start = time.time()
        status: int | str = 200
        try:
            resp = fn(*args, **kwargs)
            if isinstance(resp, tuple):
                status = resp[1]
            else:
                status = getattr(resp, "status_code", 200)
            return resp
        except Exception:  # pragma: no cover - surfaced via metrics/logging
            LOG.exception("request_failed")
            status = 500
            return jsonify({"error": "internal"}), 500
        finally:
            duration = time.time() - start
            endpoint = request.endpoint or "unknown"
            try:
                REQ_COUNT.labels(request.method, endpoint, str(status)).inc()
                REQ_LAT.labels(endpoint).observe(duration)
            except ValueError:  # pragma: no cover - defensive metrics guard
                LOG.debug("metric_label_error", exc_info=True)

    return cast(F, _wrap)


def _enforce_limits(fn: F) -> F:
    @wraps(fn)
    def _wrap(*args: Any, **kwargs: Any):
        try:
            size = int(request.headers.get("Content-Length", "0"))
        except (TypeError, ValueError):
            size = 0
        if size > MAX_BODY_BYTES:
            return jsonify({"error": "payload too large"}), 413
        return fn(*args, **kwargs)

    return cast(F, _wrap)


def _wrap_endpoint(app, endpoint: str, decorator: Callable[[F], F]) -> bool:
    if endpoint in app.view_functions:
        app.view_functions[endpoint] = decorator(app.view_functions[endpoint])  # type: ignore[assignment]
        return True
    return False


def _chain(*decorators: Callable[[F], F]) -> Callable[[F], F]:
    def _decorate(fn: F) -> F:
        for deco in reversed(decorators):
            fn = deco(fn)
        return fn

    return _decorate


def wire_alpha(app):
    """Attach alpha hardening routes and middleware to *app*."""

    @app.after_request
    def _after(resp: Response) -> Response:  # pragma: no cover - Flask ensures execution
        return _security_headers(resp)

    if not _wrap_endpoint(app, "healthz", _instrument):

        @app.route("/healthz", methods=["GET"])
        @_instrument
        def healthz():  # pragma: no cover - thin wrapper
            return jsonify({"ok": True, "uptime_s": int(time.time() - APP_START)}), 200

    if not _wrap_endpoint(app, "readyz", _instrument):

        @app.route("/readyz", methods=["GET"])
        @_instrument
        def readyz():  # pragma: no cover - thin wrapper
            return jsonify({"ready": True}), 200

    if "metrics" not in app.view_functions:

        @app.route("/metrics", methods=["GET"])
        def metrics():  # pragma: no cover - scrape endpoint
            if PROM_REGISTRY is not None:
                payload = generate_latest(PROM_REGISTRY)
            else:
                payload = generate_latest()
            return Response(payload, mimetype=CONTENT_TYPE_LATEST)

    feedback_chain = _chain(_instrument, _enforce_limits, _alpha_token_required)
    if not _wrap_endpoint(app, "feedback", feedback_chain):

        @app.route("/feedback", methods=["POST"])
        @feedback_chain
        def feedback():
            data = request.get_json(silent=True) or {}
            for key in list(data.keys()):
                if any(s in key.lower() for s in ("key", "token", "secret", "password")):
                    data[key] = "[redacted]"
            LOG.info("feedback_event", extra={"payload": data})
            return jsonify({"ok": True}), 200

    return app
