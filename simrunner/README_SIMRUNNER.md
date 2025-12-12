# Simrunner: Lifetime Simulation Suite for Ryuzen Toron Engine v2.5H+

## Purpose
Simrunner provides a deterministic, offline harness to validate Toron Engine v2.5H+ across thousands of synthetic runs. It stress-tests tier flows (T1–T4), Opus escalations, contradiction handling, and determinism to ensure long-term reliability and easy adaptation to future Toron versions.

## How to Run
1. Ensure Python 3.10+ is available.
2. From repository root, run:
   ```bash
   python simrunner/lifetime_suite.py
   ```
3. Artifacts (simulation results, determinism report, combined reports) are written to `simrunner/reports/`.

## Components
- `sim_runner.py` — orchestrates Toron runs, captures latency, tiers, contradictions, and resiliency data.
- `stability_analyzer.py` — computes latency percentiles, escalation and contradiction frequencies, instability index, and stability grade.
- `determinism_checker.py` — reruns prompts three times to gauge byte-level and semantic determinism.
- `report_builder.py` — produces text and JSON summaries with tier histograms, Opus curves, and contradiction mapping.
- `generator.py` — deterministic synthetic prompt generation with seeded randomness and fixed vocabularies.
- `lifetime_suite.py` — single entry point executing the full pipeline end-to-end.

## Adding New Tests
- Extend `generator.py` with additional templates and vocabulary entries to increase coverage.
- Update `sim_config.yaml` to adjust run counts, seeds, or snapshot modes.
- Add new analytics in `stability_analyzer.py` by incorporating additional metrics into the returned dictionary; `report_builder.py` will include them automatically if referenced in the summary.

## Adapting for Toron v3/v4/v5
- The suite avoids tight coupling: `tier_logger.py` infers tier data using resilient heuristics. If future Toron versions change payload shapes, update `_infer_tiers` or `_infer_opus` to map new keys.
- Keep the deterministic seed path intact to compare behavior across versions. Use `sim_config.yaml` to pin seeds for repeatability.
- Add version-specific metadata to the report by extending the `metadata` section in `sim_runner.py`.

## Folder Structure
```
simrunner/
  __init__.py
  sim_config.yaml
  synthetic_dataset.json
  generator.py
  sim_runner.py
  tier_logger.py
  stability_analyzer.py
  determinism_checker.py
  report_builder.py
  lifetime_suite.py
  reports/
```

## Report Interpretation
- **Dual grades**: Consumer Stability targets UX-safety (tolerant thresholds), while Epistemic Rigor enforces stricter research-grade bounds. Each grade is derived from the weighted instability index (latency, Opus, contradictions, meta flags). Epistemic "B" can still accompany a consumer "A+" when deep reasoning stays honest yet fast enough for end users.
- **Opus escalation**: Treated as judicial deep reasoning. Neutral unless escalation exceeds the defined thresholds.
- **Contradictions**: Normalized and only penalized when rates surpass the mode-specific bounds, preserving epistemic honesty.
- **Determinism score**: 100% indicates byte-for-byte identical outputs across three runs; lower values highlight nondeterminism.
- **Contradiction map**: Prompt-level contradiction counts to pinpoint problematic scenarios.

All components are offline, dependency-light (stdlib + `json`), and guard-railed to avoid crashes even when Toron errors occur. This aligns with Ryuzen's mission to ship deterministic, safety-first systems while permitting rigor to tighten over time. Future versions (v3+) can reduce thresholds to further emphasize epistemic strength without compromising consumer stability.
