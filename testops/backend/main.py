"""Entry point for TestOps FastAPI backend."""
from __future__ import annotations

import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from testops.backend.routers.testops_router import router

# Deterministic seeding for consistent simulated outputs
random.seed(42)

app = FastAPI(title="TestOps Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def health() -> dict:
    return {"status": "ok"}
