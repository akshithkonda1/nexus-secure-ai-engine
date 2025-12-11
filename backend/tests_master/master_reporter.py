"""Generate HTML and JSON reports for the master test suite."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

from .master_models import RunSummary
from .master_store import REPORT_BASE


BOOTSTRAP_CDN = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"


def build_report(run_summary: RunSummary, base_dir: Path | None = None) -> Dict[str, Path]:
    """Write HTML and JSON reports for a run."""

    report_root = (base_dir or REPORT_BASE) / run_summary.run_id
    report_root.mkdir(parents=True, exist_ok=True)
    html_path = report_root / "report.html"
    json_path = report_root / "report.json"

    metrics = run_summary.metrics
    errors = run_summary.errors

    html_content = f"""
<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <title>Master Test Report - {run_summary.run_id}</title>
  <link rel=\"stylesheet\" href=\"{BOOTSTRAP_CDN}\">
</head>
<body class=\"bg-light\">
  <div class=\"container py-4\">
    <h1 class=\"mb-3\">Master Test Suite Report</h1>
    <p class=\"text-muted\">Run ID: {run_summary.run_id} | Status: {run_summary.status.value}</p>
    <div class=\"row g-3\">
      <div class=\"col-md-4\">
        <div class=\"card shadow-sm\">
          <div class=\"card-body\">
            <h5 class=\"card-title\">Determinism</h5>
            <p class=\"display-6\">{metrics.get('determinism', {}).get('score', 0)}%</p>
            <small class=\"text-muted\">Snapshot verification results</small>
          </div>
        </div>
      </div>
      <div class=\"col-md-4\">
        <div class=\"card shadow-sm\">
          <div class=\"card-body\">
            <h5 class=\"card-title\">Load Test p95</h5>
            <p class=\"display-6\">{metrics.get('load_test', {}).get('p95_latency_ms', 'n/a')} ms</p>
            <small class=\"text-muted\">Throughput: {metrics.get('load_test', {}).get('throughput_rps', 'n/a')} rps</small>
          </div>
        </div>
      </div>
      <div class=\"col-md-4\">
        <div class=\"card shadow-sm\">
          <div class=\"card-body\">
            <h5 class=\"card-title\">Stability</h5>
            <p class=\"display-6\">{metrics.get('tier_stability', {}).get('tier1', 'n/a')}</p>
            <small class=\"text-muted\">Tier 1 model call stability</small>
          </div>
        </div>
      </div>
    </div>

    <div class=\"mt-4\">
      <h4>Latency Histogram</h4>
      <pre class=\"bg-white p-3 border\">{json.dumps(metrics.get('latency', {}), indent=2)}</pre>
    </div>

    <div class=\"mt-4\">
      <h4>Pipeline Path Distribution</h4>
      <pre class=\"bg-white p-3 border\">{json.dumps(metrics.get('pipeline_paths', {}), indent=2)}</pre>
    </div>

    <div class=\"mt-4\">
      <h4>Confidence Heatmap</h4>
      <pre class=\"bg-white p-3 border\">{json.dumps(metrics.get('confidence_distribution', {}), indent=2)}</pre>
    </div>

    <div class=\"mt-4\">
      <h4>Errors</h4>
      <table class=\"table table-striped\">
        <thead><tr><th>#</th><th>Message</th></tr></thead>
        <tbody>
          {''.join([f'<tr><td>{idx+1}</td><td>{err}</td></tr>' for idx, err in enumerate(errors)])}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
"""

    html_path.write_text(html_content, encoding="utf-8")
    json_path.write_text(json.dumps(run_summary.dict(), indent=2), encoding="utf-8")
    return {"html": html_path, "json": json_path}


__all__ = ["build_report"]
