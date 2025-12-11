from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from testops.backend.routers.testops_router import router as testops_router

app = FastAPI(title="Ryuzen TestOps")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(testops_router, prefix="/tests", tags=["tests"])


@app.get("/health")
def health():
    return {"status": "ok"}
