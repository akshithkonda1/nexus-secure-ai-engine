"""FastAPI entrypoint for TestOps backend Wave 1."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from testops.backend.routers.test_router import router as test_router

app = FastAPI(title="Ryuzen TestOps Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_router)


@app.get("/health", tags=["system"])
async def health() -> dict:
    return {"status": "ok"}


__all__ = ["app"]
