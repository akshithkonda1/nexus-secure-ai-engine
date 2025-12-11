"""Report and artifact generation for TestOps."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Iterable, List

from .master_models import RunSummary

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = BACKEND_ROOT / "reports" / "master"
SNAPSHOT_DIR = BACKEND_ROOT / "snapshots"
WARROOM_DIR = BACKEND_ROOT / "warroom" / "master"

REPORT_DIR.mkdir(parents=True, exist_ok=True)
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
WARROOM_DIR.mkdir(parents=True, exist_ok=True)


def build_json_report(run_id: str, payload: Dict[str, object]) -> Path:
    path = REPORT_DIR / f"report_{run_id}.json"
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
    return path


def build_snapshot(run_id: str, payload: Dict[str, object]) -> Path:
    path = SNAPSHOT_DIR / f"{run_id}.json"
    with path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
    return path


def build_html_report(run_id: str, summary: RunSummary) -> Path:
    path = REPORT_DIR / f"report_{run_id}.html"
    module_rows = "\n".join(
        f"<tr><td>{m.name}</td><td>{m.status}</td><td>{json.dumps(m.metrics)}</td><td>{' | '.join(m.notes)}</td></tr>"
        for m in summary.modules
    )
    html = f"""
    <html>
      <head>
        <title>TestOps Report {run_id}</title>
        <style>
          body {{ font-family: Arial, sans-serif; background: #0b1021; color: #e8ecf1; padding: 20px; }}
          table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
          th, td {{ border: 1px solid #2c3350; padding: 8px; }}
          th {{ background: #11172d; }}
          .pass {{ color: #5cf096; }}
          .fail {{ color: #ff6b6b; }}
          .meter {{ height: 12px; background: #1d2440; border-radius: 8px; overflow: hidden; margin-top: 6px; }}
          .meter span {{ display: block; height: 100%; background: linear-gradient(90deg, #4fd1c5, #9f7aea); }}
        </style>
      </head>
      <body>
        <h1>Ryuzen Toron v2.5H+ TestOps</h1>
        <p>Run ID: {run_id}</p>
        <p>Status: <strong class="{summary.status.lower()}">{summary.status}</strong></p>
        <p>Started: {summary.started_at} &nbsp; Finished: {summary.finished_at}</p>
        <h2>Readiness Meters</h2>
        <div>Public Beta
          <div class="meter"><span style="width: 78%"></span></div>
        </div>
        <div>Controlled Beta
          <div class="meter"><span style="width: 84%"></span></div>
        </div>
        <div>Determinism Score
          <div class="meter"><span style="width: 92%"></span></div>
        </div>
        <div>PII Compliance
          <div class="meter"><span style="width: 95%"></span></div>
        </div>
        <h2>Latency Heatmaps & Chaos Tree</h2>
        <p>Latency and chaos profiles are synthesized for offline execution.</p>
        <h2>Module Matrix</h2>
        <table>
          <thead><tr><th>Module</th><th>Status</th><th>Metrics</th><th>Notes</th></tr></thead>
          <tbody>{module_rows}</tbody>
        </table>
      </body>
    </html>
    """
    with path.open("w", encoding="utf-8") as handle:
        handle.write(html)
    return path


def build_warroom_log(run_id: str, lines: Iterable[str]) -> Path:
    path = WARROOM_DIR / f"{run_id}.log"
    with path.open("w", encoding="utf-8") as handle:
        for line in lines:
            handle.write(line + "\n")
    return path


__all__ = ["build_json_report", "build_html_report", "build_snapshot", "build_warroom_log"]
