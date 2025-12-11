from __future__ import annotations

import html
from typing import Dict, List

from .master_store import REPORT_DIR


def _ascii_chart(values: List[float], width: int = 40) -> str:
    if not values:
        return "(no data)"
    max_val = max(values)
    if max_val == 0:
        return "(flat)"
    buckets = [0] * width
    for idx, val in enumerate(values):
        bucket = int((idx / len(values)) * width)
        bucket = min(bucket, width - 1)
        buckets[bucket] = max(buckets[bucket], val)
    normalized = [int((v / max_val) * 8) for v in buckets]
    symbols = " ░▒▓█"
    return "".join(symbols[min(n, len(symbols) - 1)] for n in normalized)


def generate_report(run_id: str, sim_result: Dict[str, object], load_result: Dict[str, float]) -> str:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    latency_chart = _ascii_chart(sim_result.get("latency_series", [])[:200])
    confidence_chart = _ascii_chart(sim_result.get("confidence_scores", [])[:200])

    html_body = f"""
    <article>
      <h1>Ryuzen Toron v2.5H+ Validation Report — {html.escape(run_id)}</h1>
      <section>
        <h2>SIM Metrics</h2>
        <p>Average latency: {sim_result.get('avg_latency')} ms</p>
        <p>Average confidence: {sim_result.get('avg_confidence')}</p>
        <p>Determinism: {sim_result.get('determinism')}</p>
        <pre>{html.escape(latency_chart)}</pre>
        <pre>{html.escape(confidence_chart)}</pre>
      </section>
      <section>
        <h2>Load (k6)</h2>
        <p>p95: {load_result.get('p95')} ms · p99: {load_result.get('p99')} ms · error rate: {load_result.get('error_rate')}</p>
        <p>Throughput: {load_result.get('throughput_rps')} rps</p>
      </section>
    </article>
    """
    report_path = REPORT_DIR / f"{run_id}.html"
    report_path.write_text(html_body, encoding="utf-8")
    return str(report_path)


__all__ = ["generate_report"]
