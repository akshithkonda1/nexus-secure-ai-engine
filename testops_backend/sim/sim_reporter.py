import json
from pathlib import Path
from typing import Dict, List
from testops_backend.core.config import REPORT_DIR


def write_sim_report(run_id: str, payload: Dict) -> str:
    path = REPORT_DIR / f"{run_id}_sim.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    return str(path)


def write_sim_html_report(
    run_id: str,
    *,
    latency_map: Dict[str, List[float]],
    tier_failures: Dict[str, int],
    contradiction_map: List[Dict[str, str]],
    confidence_distribution: List[float],
    determinism_baseline: str,
    metrics: Dict[str, float],
) -> str:
    html_path = REPORT_DIR / f"{run_id}_sim.html"
    tiers_html = "".join(
        f"<li><strong>{tier}</strong>: latencies={vals}, failures={tier_failures.get(tier, 0)}</li>"
        for tier, vals in latency_map.items()
    )
    contradictions_html = "".join(
        f"<li>{item['prompt']} ({item['tier']})</li>" for item in contradiction_map
    ) or "<li>None detected</li>"
    confidence_html = ", ".join(map(str, confidence_distribution))

    html = f"""
    <html>
    <head><title>Simulation Report {run_id}</title></head>
    <body>
        <h1>Toron Simulation Report</h1>
        <p><strong>Run ID:</strong> {run_id}</p>
        <p><strong>Determinism Baseline:</strong> {determinism_baseline}</p>
        <h2>Latency Map</h2>
        <ul>{tiers_html}</ul>
        <h2>Tier Failures</h2>
        <pre>{json.dumps(tier_failures, indent=2)}</pre>
        <h2>Contradiction Map</h2>
        <ul>{contradictions_html}</ul>
        <h2>Confidence Distribution</h2>
        <p>{confidence_html}</p>
        <h2>Metrics</h2>
        <pre>{json.dumps(metrics, indent=2)}</pre>
    </body>
    </html>
    """
    html_path.write_text(html, encoding="utf-8")
    return str(html_path)
