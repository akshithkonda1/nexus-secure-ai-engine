from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tests_master.master_router import router as master_router
import os

app = FastAPI(title="Ryuzen TestOps Platform", version="1.0.0")

# CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure required directories
REQUIRED_DIRS = [
    "logs/master",
    "reports/master",
    "load_results",
    "warroom/master",
    "snapshots",
    "database",
]

for d in REQUIRED_DIRS:
    os.makedirs(d, exist_ok=True)

# Mount router
app.include_router(master_router, prefix="/tests", tags=["Testing"])


@app.get("/")
async def root():
    return {"status": "Ryuzen TestOps Backend Running"}
