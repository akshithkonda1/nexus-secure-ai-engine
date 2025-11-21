"""Error shaping middleware to ensure consistent JSON error responses."""
from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

logger = logging.getLogger(__name__)


class ErrorShaper:
    """Convert exceptions into sanitized error payloads."""

    GENERIC_TYPE = "internal_error"

    def shape(self, exc: Exception) -> Dict[str, Any]:
        details: Dict[str, Any] = {}
        error_type = getattr(exc, "__class__", type("", (), {}))
        type_name = error_type.__name__ if hasattr(error_type, "__name__") else self.GENERIC_TYPE
        message = str(exc) or "Unexpected server error"

        return {"error": message, "type": type_name, "details": details}

    def status_code(self, exc: Exception) -> int:
        return getattr(exc, "status_code", HTTP_500_INTERNAL_SERVER_ERROR)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware that shapes uncaught exceptions into JSON responses."""

    def __init__(self, app: FastAPI, shaper: Optional[ErrorShaper] = None) -> None:
        super().__init__(app)
        self.shaper = shaper or ErrorShaper()

    async def dispatch(self, request: Request, call_next):  # type: ignore[override]
        try:
            return await call_next(request)
        except Exception as exc:  # noqa: BLE001
            shaped = self.shaper.shape(exc)
            status_code = self.shaper.status_code(exc)
            logger.exception("Unhandled exception during request", exc_info=exc)
            return JSONResponse(status_code=status_code, content=shaped)


def apply_error_handling(app: FastAPI) -> None:
    """Attach the error-handling middleware."""

    app.add_middleware(ErrorHandlingMiddleware)

