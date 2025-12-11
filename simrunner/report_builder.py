"""Report builder producing human-readable and machine-friendly outputs."""
from __future__ import annotations

import json
import os
from collections import Counter, defaultdict
from typing import Any, Dict, List


def _tier_histogram(results: List[Dict[str, Any]]) -> Dict[str, int]:
    counter: Counter[str] = Counter()
    for entry in results:
        for tier in entry.get("tier_path", []) or []:
            counter[tier] += 1
    return dict(counter)


def _contradiction_map(results: List[Dict[str, Any]]) -> Dict[str, int]:
    mapping: Dict[str, int] = {}
    for entry in results:
        prompt = entry.get("prompt", "")
        mapping[prompt] = int(entry.get("contradiction_count", 0))
    return mapping


def _opus_curve(results: List[Dict[str, Any]]) -> Dict[str, float]:
    buckets: defaultdict[str, List[int]] = defaultdict(list)
    for entry in results:
        bucket = "T4" if "T4" in (entry.get("tier_path") or []) else "Lower"
        buckets[bucket].append(1 if entry.get("opus_used") else 0)
    return {key: sum(vals) / len(vals) if vals else 0.0 for key, vals in buckets.items()}


def _text_report(summary: Dict[str, Any]) -> str:
    lines = [
        "Ryuzen Toron Engine Simulation Report",
        "====================================",
        "",
        f"Run count: {summary['metadata'].get('run_count')}",
        f"Seed: {summary['metadata'].get('seed')}",
        f"Stability grade: {summary['stability'].get('stability_grade')}",
        f"Instability index: {summary['stability'].get('instability_index')}",
        f"Average latency (ms): {summary['stability'].get('average_latency_ms')}",
        f"p95 latency (ms): {summary['stability'].get('p95_latency_ms')}",
        f"Contradiction frequency: {summary['stability'].get('contradiction_frequency')}",
        f"Escalation frequency: {summary['stability'].get('escalation_frequency')}",
        f"Determinism score: {summary['determinism'].get('determinism_score')}",
        "",
        "Tier Usage Histogram:",
    ]
    for tier, count in summary.get("tier_histogram", {}).items():
        lines.append(f"- {tier}: {count}")

    lines.append("")
    lines.append("Opus escalation (by bucket):")
    for bucket, rate in summary.get("opus_curve", {}).items():
        lines.append(f"- {bucket}: {round(rate, 4)}")

    lines.append("")
    lines.append("Determinism samples:")
    for test in summary.get("determinism", {}).get("tests", [])[:5]:
        lines.append(f"- {test['prompt'][:60]}... :: {test.get('determinism_score')}%")

    return "\n".join(lines)


def build_reports(
    simulation_output: Dict[str, Any],
    stability_metrics: Dict[str, Any],
    determinism_report: Dict[str, Any],
    output_dir: str = os.path.join("simrunner", "reports"),
) -> Dict[str, str]:
    os.makedirs(output_dir, exist_ok=True)
    tier_histogram = _tier_histogram(simulation_output.get("results", []))
    contradiction_map = _contradiction_map(simulation_output.get("results", []))
    opus_curve = _opus_curve(simulation_output.get("results", []))

    summary = {
        "metadata": simulation_output.get("metadata", {}),
        "stability": stability_metrics,
        "determinism": determinism_report,
        "tier_histogram": tier_histogram,
        "contradictions": contradiction_map,
        "opus_curve": opus_curve,
    }

    timestamp = simulation_output.get("metadata", {}).get("generated_at") or determinism_report.get("generated_at")
    timestamp = timestamp or "report"
    text_report = _text_report(summary)
    json_report = {
        "summary": summary,
        "results_file": simulation_output.get("results_file"),
        "determinism_file": determinism_report.get("output_file"),
    }

    text_path = os.path.join(output_dir, f"report_{timestamp}.txt")
    json_path = os.path.join(output_dir, f"report_{timestamp}.json")

    try:
        with open(text_path, "w", encoding="utf-8") as handle:
            handle.write(text_report)
        with open(json_path, "w", encoding="utf-8") as handle:
            json.dump(json_report, handle, indent=2)
    except Exception:
        pass

    return {"text_report": text_path, "json_report": json_path}


__all__ = ["build_reports"]
