# Contributing to TestOps

## Purpose
Guide contributors on how to propose, develop, and ship changes to the TestOps system and Toron v2.5H+ artifacts.

## Architecture
- **Developer Workstation** -> **CI Pipeline** -> **Artifacts** -> **Warroom Decision**.
- Contributions must preserve offline determinism and PII controls.

### Flow Diagram
```
[Branch] -> [Lint/Tests/Sim] -> [Snapshot Compare] -> [PR Review] -> [Merge]
```

## Component Interaction
1. Developers branch from `main`, implement changes, and run local suites.
2. CI executes lint, unit, sim, hardening, chaos/load, snapshot-compare, and build jobs.
3. Warroom tracks incidents for regressions; maintainers gate merges.

## API References
- `POST /v1/test-runs` — trigger pipeline from CLI.
- `GET /v1/reports/{id}` — fetch results for PR descriptions.
- `POST /v1/warroom/incidents` — open incident for regression findings.

## Workflow
1. Fork/branch from `main`; keep changes offline-compatible.
2. Run local checks: lint, tests, sim-suite, snapshot-compare.
3. Submit PR with full artifact attachments; CI must be green.
4. Security review required for telemetry/PII-impacting changes.

## Code Style
- Python: follow `STYLE_AND_LINTING_GUIDE.md`; ruff/flake8 enforced.
- Markdown: 80–100 char preference, descriptive headings.
- SVG/ASCII diagrams only; no binaries.

## Command Examples
- `make lint format`
- `pytest backend/tests_master backend/ryuzen/engine/toron_v25hplus.py`
- `python sim/run_suite.py --profile offline`
- `python tools/snapshot_compare.py --base snapshots/golden --target snapshots/dev`

## Troubleshooting
- **Failing determinism**: refresh fixtures and re-run sim-suite with fixed seed.
- **CI flake**: rerun in offline mode; attach logs from `reports/`.

## Upgrade Paths
- Update docs and snapshots when engine changes; rerun sim-suite.
- Align new features with hardening phase expectations.

## Versioning Notes
- Update `VERSIONING_AND_RELEASE_NOTES.md` for user-visible changes.
- Document migration impacts in `V3_MIGRATION_GUIDE.md` when applicable.
