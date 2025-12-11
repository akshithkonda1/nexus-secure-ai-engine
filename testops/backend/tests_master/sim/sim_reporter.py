"""Reporter for SIM suite."""
from __future__ import annotations

from pathlib import Path
from typing import Dict


REPORT_PATH = Path(__file__).resolve().parent / "sim_report.html"
SUMMARY_PATH = Path(__file__).resolve().parent / "sim_summary.json"


def write_report(payload: Dict[str, object]) -> Path:
    html = f"<html><body><pre>{payload}</pre></body></html>"
    REPORT_PATH.write_text(html)
    return REPORT_PATH


def write_summary(payload: Dict[str, object]) -> Path:
    import json

    SUMMARY_PATH.write_text(json.dumps(payload, indent=2))
    return SUMMARY_PATH
