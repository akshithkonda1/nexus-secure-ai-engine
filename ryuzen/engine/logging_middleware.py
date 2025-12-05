"""HTTP logging middleware for Toron Engine APIs.

This middleware is designed for async frameworks such as FastAPI/Starlette
and records request/response metrics without blocking the event loop.
"""
from __future__ import annotations

import json
import logging
import time
from typing import Any, Dict, Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from ryuzen.engine.simulation_mode import SimulationMode

logger = logging.getLogger("ryuzen.engine.http")


def _parse_response_body(response: Response) -> Optional[Dict[str, Any]]:
    body: Optional[bytes] = getattr(response, "body", None)
    if body is None:
        return None
    try:
        return json.loads(body.decode(response.charset or "utf-8"))
    except Exception:
        return None


class EngineLoggingMiddleware(BaseHTTPMiddleware):
    """Log detailed request/response metadata for observability."""

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        start_time = time.perf_counter()
        raw_body = await request.body()
        request_size = len(raw_body)

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        content_length_header = response.headers.get("content-length")
        response_size = int(content_length_header) if content_length_header else None

        if response_size is None:
            body_attr = getattr(response, "body", b"") or b""
            response_size = len(body_attr)

        provider_latency = None
        provider_count = None
        if SimulationMode.is_enabled():
            parsed_body = _parse_response_body(response)
            if parsed_body and isinstance(parsed_body, dict):
                responses = parsed_body.get("responses")
                if isinstance(responses, list):
                    latencies = [
                        entry.get("latency_ms")
                        for entry in responses
                        if isinstance(entry, dict) and isinstance(entry.get("latency_ms"), (int, float))
                    ]
                    if latencies:
                        provider_latency = {
                            "avg_latency_ms": sum(latencies) / len(latencies),
                            "max_latency_ms": max(latencies),
                            "min_latency_ms": min(latencies),
                        }
                        provider_count = len(latencies)

        client_host = request.client.host if request.client else "unknown"
        log_payload: Dict[str, Any] = {
            "path": request.url.path,
            "method": request.method,
            "status": response.status_code,
            "latency_ms": round(duration_ms, 2),
            "request_size_bytes": request_size,
            "response_size_bytes": response_size,
            "client_ip": client_host,
        }

        if provider_latency is not None:
            log_payload["provider_latency"] = provider_latency
        if provider_count is not None:
            log_payload["provider_count"] = provider_count

        logger.info(
            "HTTP %s %s status=%s latency_ms=%.2f ip=%s req=%sB res=%sB providers=%s",
            request.method,
            request.url.path,
            response.status_code,
            log_payload["latency_ms"],
            client_host,
            request_size,
            response_size,
            provider_count,
            extra={"http_event": log_payload},
        )
        return response
