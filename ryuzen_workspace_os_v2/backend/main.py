from fastapi import FastAPI
from .routers import lists, calendar, tasks, connectors, pages, notes, boards, flows, toron

app = FastAPI(title="Ryuzen Workspace OS V2")

app.include_router(lists.router, prefix="/api/lists", tags=["lists"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(connectors.router, prefix="/api/connectors", tags=["connectors"])
app.include_router(pages.router, prefix="/api/pages", tags=["pages"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(boards.router, prefix="/api/boards", tags=["boards"])
app.include_router(flows.router, prefix="/api/flows", tags=["flows"])
app.include_router(toron.router, prefix="/api/toron", tags=["toron"])


@app.get("/api/health")
def health_check():
  return {"status": "ok", "service": "ryuzen-workspace-os-v2"}
