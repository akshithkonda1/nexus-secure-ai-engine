"""Unified lifetime simulation suite runner."""
from __future__ import annotations

import os
import sys
from typing import Any, Dict

from .determinism_checker import run_determinism_checks
from .report_builder import build_reports
from .sim_runner import run_simulations
from .stability_analyzer import analyze_stability


def main() -> Dict[str, Any]:
    base_dir = os.path.join("simrunner", "reports")
    simulation_output = run_simulations(output_dir=base_dir)
    stability_metrics = analyze_stability(simulation_output.get("results", []))
    determinism_report = run_determinism_checks(output_dir=base_dir)
    reports = build_reports(simulation_output, stability_metrics, determinism_report, output_dir=base_dir)

    summary = {
        "simulation": simulation_output,
        "stability": stability_metrics,
        "determinism": determinism_report,
        "reports": reports,
    }

    print("Ryuzen Toron Engine Lifetime Suite")
    print("-----------------------------------")
    print(f"Simulations completed: {simulation_output['metadata'].get('run_count')}")
    print(f"Stability grade: {stability_metrics.get('stability_grade')}")
    print(f"Determinism score: {determinism_report.get('determinism_score')}%")
    print(f"Reports saved to: {reports.get('text_report')} and {reports.get('json_report')}")

    return summary


if __name__ == "__main__":  # pragma: no cover
    run_summary = main()
    stability_grade = (run_summary.get("stability") or {}).get("stability_grade")
    exit_code = 0 if stability_grade in {"A+", "A", "B"} else 1
    sys.exit(exit_code)
