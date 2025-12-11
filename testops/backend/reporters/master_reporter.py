"""Master reporter for TestOps Wave 3.

Generates JSON + HTML reports with inline SVG charts for latency, determinism,
and load indicators. Artifacts are placed under
``testops/backend/reports/<run_id>/`` to keep runs isolated and portable.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, List, Mapping

TEMPLATE_PATH = Path(__file__).resolve().parent / "templates" / "report.html"
REPORT_ROOT = Path(__file__).resolve().parents[1] / "reports"


@dataclass
class ReportPaths:
    run_id: str
    base_dir: Path
    html_path: Path
    json_path: Path


def _ensure_dir(run_id: str) -> Path:
    base_dir = REPORT_ROOT / run_id
    base_dir.mkdir(parents=True, exist_ok=True)
    return base_dir


def _build_latency_svg(latencies: Iterable[float]) -> str:
    values = list(latencies)
    if not values:
        return "<svg width='320' height='120'></svg>"
    bins = 8
    max_v = max(values) or 1
    bucket = max(len(values) // bins, 1)
    histogram: List[float] = []
    for idx in range(0, len(values), bucket):
        window = values[idx : idx + bucket]
        histogram.append(sum(window) / len(window))
    width = 360
    height = 140
    bar_width = (width - 40) / max(len(histogram), 1)
    bars = []
    for i, val in enumerate(histogram):
        bar_height = (val / max_v) * (height - 40)
        x = 20 + i * bar_width
        y = height - 20 - bar_height
        bars.append(
            f"<rect x='{x:.1f}' y='{y:.1f}' width='{bar_width-4:.1f}' height='{bar_height:.1f}' fill='#22d3ee' rx='3'/>"
        )
    return (
        f"<svg width='{width}' height='{height}' viewBox='0 0 {width} {height}' xmlns='http://www.w3.org/2000/svg'>"
        "<rect width='100%' height='100%' fill='#0b1220' rx='12'/>"
        "<text x='20' y='22' fill='#e2e8f0' font-size='12'>Latency histogram</text>"
        + "".join(bars)
        + "</svg>"
    )


def _build_determinism_svg(score: float | None) -> str:
    value = max(0.0, min(100.0, float(score or 0)))
    width = 360
    height = 100
    bar_width = (width - 60) * (value / 100)
    color = "#16a34a" if value >= 90 else "#f59e0b" if value >= 70 else "#ef4444"
    return (
        f"<svg width='{width}' height='{height}' viewBox='0 0 {width} {height}' xmlns='http://www.w3.org/2000/svg'>"
        "<rect width='100%' height='100%' fill='#0b1220' rx='12'/>"
        "<text x='20' y='24' fill='#e2e8f0' font-size='12'>Determinism score</text>"
        f"<rect x='20' y='40' width='{width-60}' height='20' fill='#1f2937' rx='6'/>"
        f"<rect x='20' y='40' width='{bar_width:.1f}' height='20' fill='{color}' rx='6'/>"
        f"<text x='{width-40}' y='54' fill='#e2e8f0' font-size='12' text-anchor='end'>{value:.2f}</text>"
        "</svg>"
    )


def _build_load_svg(p95: float | None, threshold: float = 350.0) -> str:
    metric = float(p95 or 0)
    width = 360
    height = 120
    capped = min(metric, threshold * 1.5)
    indicator = (capped / (threshold * 1.5)) * (width - 60)
    color = "#16a34a" if metric <= threshold else "#f97316" if metric <= threshold * 1.2 else "#ef4444"
    return (
        f"<svg width='{width}' height='{height}' viewBox='0 0 {width} {height}' xmlns='http://www.w3.org/2000/svg'>"
        "<rect width='100%' height='100%' fill='#0b1220' rx='12'/>"
        "<text x='20' y='24' fill='#e2e8f0' font-size='12'>Load test p95 (ms)</text>"
        f"<rect x='20' y='50' width='{width-60}' height='10' fill='#1f2937' rx='5'/>"
        f"<circle cx='{20+indicator:.1f}' cy='55' r='8' fill='{color}'/>"
        f"<text x='{width-40}' y='90' fill='#e2e8f0' font-size='12' text-anchor='end'>{metric:.2f} ms</text>"
        f"<text x='20' y='90' fill='#94a3b8' font-size='11'>Target ≤ {threshold:.0f}ms</text>"
        "</svg>"
    )


def _render_table_rows(items: Iterable[Mapping[str, Any]], fields: List[str]) -> str:
    rows: List[str] = []
    for item in items:
        cells = [f"<td>{json.dumps(item.get(field, ''), ensure_ascii=False)}</td>" for field in fields]
        rows.append("<tr>" + "".join(cells) + "</tr>")
    return "\n".join(rows)


def _load_template() -> str:
    if not TEMPLATE_PATH.exists():
        raise FileNotFoundError(f"Missing report template at {TEMPLATE_PATH}")
    return TEMPLATE_PATH.read_text(encoding="utf-8")


def generate_json_report(run_id: str, data: Mapping[str, Any]) -> ReportPaths:
    base_dir = _ensure_dir(run_id)
    json_path = base_dir / "report.json"
    json_path.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")
    html_placeholder = base_dir / "report.html"
    return ReportPaths(run_id=run_id, base_dir=base_dir, html_path=html_placeholder, json_path=json_path)


def generate_html_report(run_id: str, data: Mapping[str, Any]) -> ReportPaths:
    base_dir = _ensure_dir(run_id)
    json_report = base_dir / "report.json"
    summary = data.get("summary", {})
    subsystems = data.get("subsystems", [])
    warroom = data.get("warroom", [])
    snapshot_meta = data.get("snapshot", {})
    latency_chart = _build_latency_svg(data.get("latency_samples", []))
    determinism_chart = _build_determinism_svg(summary.get("determinism_score"))
    load_chart = _build_load_svg(data.get("load_metrics", {}).get("p95_ms"))
    template = _load_template()

    summary_rows = "\n".join(
        f"<tr><th>{key}</th><td>{json.dumps(value)}</td></tr>"
        for key, value in summary.items()
    )
    subsystem_rows = "\n".join(
        f"<tr><td>{module.get('name')}</td><td class='{str(module.get('status','')).lower()}'>{module.get('status')}</td>"
        f"<td><pre>{json.dumps(module.get('metrics', {}), indent=2)}</pre></td>"
        f"<td>{' | '.join(module.get('notes', []))}</td></tr>"
        for module in subsystems
    )
    warroom_rows = _render_table_rows(warroom, ["timestamp", "severity", "subsystem", "message", "suggestion", "score"])
    pipeline_notes = (
        "<li>" + "</li><li>".join(data.get("pipeline_status", {}).get("notes", [])) + "</li>"
        if data.get("pipeline_status", {}).get("notes")
        else "<li>All checks passed</li>"
    )

    html_body = template.format(
        run_id=run_id,
        summary_rows=summary_rows,
        subsystem_rows=subsystem_rows,
        warroom_rows=warroom_rows,
        snapshot_metadata=json.dumps(snapshot_meta, indent=2),
        latency_chart=latency_chart,
        determinism_chart=determinism_chart,
        load_chart=load_chart,
        pipeline_notes=pipeline_notes,
    )
    html_path = base_dir / "report.html"
    html_path.write_text(html_body, encoding="utf-8")
    if not json_report.exists():
        json_report.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")
    return ReportPaths(run_id=run_id, base_dir=base_dir, html_path=html_path, json_path=json_report)


__all__ = [
    "ReportPaths",
    "generate_json_report",
    "generate_html_report",
]
