from __future__ import annotations

import html
import json
from pathlib import Path
from typing import Any, Dict, List

REPORT_DIR = Path("reports/master")
ASCII_BARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]


def _ascii_chart(values: List[float]) -> str:
    if not values:
        return "(no data)"
    lo, hi = min(values), max(values)
    span = (hi - lo) or 1.0
    normalized = [int((v - lo) / span * (len(ASCII_BARS) - 1)) for v in values]
    return "".join(ASCII_BARS[idx] for idx in normalized)


def generate_report(run_id: str, sim_result: Dict[str, Any], load_result: Dict[str, Any]) -> Path:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    confidence_scores = sim_result.get("confidence_scores", [])[:60]
    latency_samples = [sim_result.get("latencies", {}).get("average_ms", 0.0)]
    latency_samples.append(sim_result.get("latencies", {}).get("p95_ms", 0.0))
    latency_chart = _ascii_chart(latency_samples)
    confidence_chart = _ascii_chart(confidence_scores)

    html_content = f"""
<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8' />
  <title>Ryuzen TestOps Report {html.escape(run_id)}</title>
  <style>
    body {{ background: #0d1117; color: #e6edf3; font-family: 'Fira Code', monospace; padding: 2rem; }}
    section {{ margin-bottom: 1.5rem; }}
    h1, h2 {{ color: #8be9fd; }}
    pre {{ background: #161b22; padding: 1rem; border-radius: 8px; overflow-x: auto; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }}
    .card {{ background: #161b22; padding: 1rem; border-radius: 8px; }}
  </style>
</head>
<body>
  <h1>Ryuzen Toron v2.5H+ Test Report</h1>
  <section class="grid">
    <div class="card"><strong>Run ID:</strong> {html.escape(run_id)}</div>
    <div class="card"><strong>P95 Latency (k6):</strong> {load_result.get('p95_latency_ms', 'n/a')} ms</div>
    <div class="card"><strong>P99 Latency (k6):</strong> {load_result.get('p99_latency_ms', 'n/a')} ms</div>
    <div class="card"><strong>Engine Avg Latency:</strong> {sim_result.get('latencies', {}).get('average_ms', 'n/a')} ms</div>
    <div class="card"><strong>Determinism Score:</strong> {sim_result.get('determinism_score', 'n/a')}</div>
    <div class="card"><strong>Opus Usage Rate:</strong> {sim_result.get('opus_usage_rate', 'n/a')}</div>
  </section>
  <section>
    <h2>ASCII Metrics</h2>
    <div class="card">
      <p><strong>Latency Trace:</strong></p>
      <pre>{latency_chart}</pre>
      <p><strong>Confidence Trace:</strong></p>
      <pre>{confidence_chart}</pre>
    </div>
  </section>
  <section>
    <h2>Raw Data</h2>
    <pre>{html.escape(json.dumps({'sim_result': sim_result, 'load_result': load_result}, indent=2))}</pre>
  </section>
</body>
</html>
"""
    report_path = REPORT_DIR / f"{run_id}.html"
    report_path.write_text(html_content, encoding="utf-8")
    return report_path


if __name__ == "__main__":
    sample_sim = {
        "latencies": {"average_ms": 123.4, "p95_ms": 140.1},
        "confidence_scores": [0.9, 0.8, 0.95],
        "determinism_score": 0.999,
        "opus_usage_rate": 0.5,
    }
    sample_load = {"p95_latency_ms": 300, "p99_latency_ms": 340}
    path = generate_report("demo", sample_sim, sample_load)
    print(path)
