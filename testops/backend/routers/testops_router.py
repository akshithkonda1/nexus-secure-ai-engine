from fastapi import APIRouter
from uuid import uuid4

router = APIRouter()

_fake_runs = {}


@router.post("/run_all")
def run_all_tests():
    run_id = str(uuid4())
    _fake_runs[run_id] = {"status": "running", "progress": 0}
    return {"run_id": run_id, "status": "started"}


@router.get("/status/{run_id}")
def get_status(run_id: str):
    return _fake_runs.get(run_id, {"status": "unknown"})


@router.get("/stream/{run_id}")
def stream(run_id: str):
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse("stream stub")
