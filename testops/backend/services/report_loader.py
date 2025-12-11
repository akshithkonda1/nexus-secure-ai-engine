"""Service for loading HTML reports."""
from __future__ import annotations

from pathlib import Path

from fastapi import HTTPException
from fastapi.responses import HTMLResponse

REPORT_DIR = Path(__file__).resolve().parent.parent / "reports"


def load_report(run_id: str) -> HTMLResponse:
    report_path = REPORT_DIR / f"{run_id}.html"
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not found for run_id")
    content = report_path.read_text(encoding="utf-8")
    return HTMLResponse(content=content)


__all__ = ["load_report", "REPORT_DIR"]
