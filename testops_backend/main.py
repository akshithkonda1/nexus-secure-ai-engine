from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from testops_backend.core.store import init_db
from testops_backend.tests_master.master_router import router as master_router

app = FastAPI(title="TestOps Backend", version="2.5H+")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.get("/health", response_class=PlainTextResponse)
async def health():
    return "ok"


app.include_router(master_router)
