"""FastAPI bootstrap for TestOps Section 1.

This lightweight application exposes test execution endpoints and
streams synthetic logs suitable for frontend dashboards.
"""
from __future__ import annotations

from typing import Any, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from testops.backend.routers.test_router import router as test_router

app = FastAPI(title="Ryuzen TestOps Section 1", version="2.5H+")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> Dict[str, Any]:
    """Return basic API metadata."""
    return {"service": app.title, "version": app.version}


app.include_router(test_router, prefix="/tests", tags=["tests"])


async def lifespan(app: FastAPI):
    """Async context hook to start background housekeeping if needed."""
    yield


__all__ = ["app", "lifespan"]
