from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Dict

REPORT_DIR = Path("backend/reports/master")
SNAPSHOT_DIR = Path("backend/snapshots")

REPORT_DIR.mkdir(parents=True, exist_ok=True)
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)


def render_report(run_id: str, results: Dict[str, Dict]) -> str:
    timestamp = datetime.utcnow().isoformat()
    html = [
        "<html><head><title>Ryuzen Master Report</title>",
        "<style>body{font-family:Arial;} .phase{margin-bottom:16px;} .pass{color:green;} .fail{color:red;} .meter{height:12px;background:#eee;}"
        " .meter-inner{height:12px;background:#4caf50;} table{border-collapse:collapse;width:100%;} td,th{border:1px solid #ddd;padding:8px;}" "</style>",
        "</head><body>",
        f"<h1>Ryuzen Master Report - {run_id}</h1>",
        f"<p>Generated: {timestamp}</p>",
        "<h2>Confidence & Readiness</h2>",
        "<table><tr><th>Metric</th><th>Value</th></tr>",
        f"<tr><td>Latency Heatmap</td><td>{results.get('sim',{}).get('metrics',{}).get('latency_heatmap','N/A')}</td></tr>",
        f"<tr><td>Determinism Score</td><td>{results.get('replay',{}).get('metrics',{}).get('determinism', 'N/A')}</td></tr>",
        f"<tr><td>Tier Stability</td><td>{results.get('engine_hardening',{}).get('metrics',{}).get('tier_stability','N/A')}</td></tr>",
        f"<tr><td>Chaos Resilience</td><td>{results.get('load_and_chaos',{}).get('metrics',{}).get('chaos_resilience','N/A')}</td></tr>",
        f"<tr><td>PII Compliance</td><td>{results.get('security_hardening',{}).get('metrics',{}).get('pii_compliance','N/A')}</td></tr>",
        f"<tr><td>Multi-Cloud Score</td><td>{results.get('cloud_hardening',{}).get('metrics',{}).get('multi_cloud','N/A')}</td></tr>",
        f"<tr><td>Beta Readiness</td><td>{results.get('beta_readiness',{}).get('metrics',{}).get('score','N/A')}</td></tr>",
        f"<tr><td>Public Readiness</td><td>{results.get('public_beta',{}).get('metrics',{}).get('score','N/A')}</td></tr>",
        "</table>",
    ]
    for phase, data in results.items():
        html.append(f"<div class='phase'><h3>{phase.title()}</h3>")
        status_class = "pass" if data.get("status") == "PASS" else "fail"
        html.append(f"<p class='{status_class}'>Status: {data.get('status')}</p>")
        html.append("<pre>")
        for log in data.get("logs", []):
            html.append(log)
        html.append("</pre></div>")
    html.append("</body></html>")
    return "".join(html)


def write_report(run_id: str, results: Dict[str, Dict]) -> str:
    html_content = render_report(run_id, results)
    report_path = REPORT_DIR / f"report_{run_id}.html"
    report_path.write_text(html_content)
    return str(report_path)


def write_snapshot(run_id: str, results: Dict[str, Dict]) -> str:
    snapshot_path = SNAPSHOT_DIR / f"summary_{run_id}.json"
    snapshot_path.write_text(json.dumps(results, indent=2))
    return str(snapshot_path)
