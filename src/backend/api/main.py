from __future__ import annotations

from fastapi import FastAPI

from .routers import llm, projects

app = FastAPI(title="Projects API", version="1.0.0")

app.include_router(projects.router)
app.include_router(llm.router)


@app.get("/health")
def healthcheck():
    return {"status": "ok"}
