from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.testops_router import router as testops_router

app = FastAPI(title="Ryuzen TestOps Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(testops_router, prefix="/tests")
