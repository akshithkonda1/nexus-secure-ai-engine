from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.tests_master.master_router import router as test_router

app = FastAPI(title="Ryuzen TestOps Suite", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Ensure required directories
REQUIRED_DIRS = [
    "backend/logs/master",
    "backend/reports/master",
    "backend/load_results",
    "backend/warroom/master",
    "backend/snapshots",
]

for path in REQUIRED_DIRS:
    Path(path).mkdir(parents=True, exist_ok=True)


@app.get("/engine_health")
def engine_health():
    """Lightweight Toron engine handshake before allowing test runs."""
    try:
        from ryuzen.engine.toron_v25hplus import ToronEngine

        engine = ToronEngine()
        result = engine.quick_health_check()
    except Exception as e:  # noqa: BLE001
        return {"status": "fail", "error": str(e)}

    return {
        "status": "ok",
        "engine": "Toron v2.5H+",
        "ready": True,
        "details": result,
    }


app.include_router(test_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8088)
