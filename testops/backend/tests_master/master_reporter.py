"""Reporting utilities for TestOps master runs."""
from __future__ import annotations

import json
import zipfile
from pathlib import Path
from typing import Any, Dict, Iterable, List

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = BACKEND_ROOT / "reports" / "master"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR = BACKEND_ROOT / "logs" / "master"
SNAPSHOT_DIR = BACKEND_ROOT / "snapshots"
LOAD_RESULTS_DIR = BACKEND_ROOT / "load_results"


def build_json_report(run_id: str, payload: Dict[str, Any]) -> Path:
    report_path = REPORTS_DIR / f"{run_id}.json"
    report_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return report_path


def build_html_report(run_id: str, payload: Dict[str, Any]) -> Path:
    html_path = REPORTS_DIR / f"{run_id}.html"
    summary_rows: List[str] = []
    for section, data in payload.items():
        summary_rows.append(f"<h2>{section}</h2><pre>{json.dumps(data, indent=2)}</pre>")
    html_body = "\n".join(summary_rows)
    html = f"""
    <html>
      <head><title>TestOps Report {run_id}</title></head>
      <body>
        <h1>Run {run_id}</h1>
        {html_body}
      </body>
    </html>
    """
    html_path.write_text(html, encoding="utf-8")
    return html_path


def build_bundle(run_id: str, artifacts: Iterable[Path]) -> Path:
    bundle_path = REPORTS_DIR / f"{run_id}.zip"
    with zipfile.ZipFile(bundle_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for artifact in artifacts:
            if artifact.exists():
                archive.write(artifact, arcname=artifact.name)
    for directory in (SNAPSHOT_DIR, LOAD_RESULTS_DIR, LOG_DIR):
        for artifact in directory.glob(f"{run_id}*"):
            archive.write(artifact, arcname=artifact.name)
    return bundle_path


__all__ = ["build_json_report", "build_html_report", "build_bundle", "REPORTS_DIR"]
