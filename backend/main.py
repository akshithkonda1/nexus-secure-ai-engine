from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.tests_master.master_router import router as test_router

app = FastAPI(title="Ryuzen TestOps Suite", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure required directories
REQUIRED_DIRS = [
    "backend/logs/master",
    "backend/reports/master",
    "backend/load_results",
    "backend/warroom/master",
    "backend/snapshots",
]

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8088)
