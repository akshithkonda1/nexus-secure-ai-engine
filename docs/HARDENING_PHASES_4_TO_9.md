# Hardening Phases 4 to 9

## Purpose
Define the structured hardening journey for TestOps and Toron v2.5H+ from engine fortification to public beta readiness.

## Architecture
- **Runner Orchestrator** calls dedicated hardening suites.
- **Engine/Cloud/Security Probes** executed with deterministic seeds.
- **Reports + Warroom** collect scores and block promotion when thresholds fail.

### Interaction Diagram
```
[Runner] -> [Hardening Scripts] -> [Toron Engine / Cloud Emulators]
                      |                   |
                      v                   v
                [Reports JSON]        [Warroom Alerts]
```

## API References
- `POST /v1/hardening/execute` — trigger specified phase.
- `GET /v1/hardening/{phase}/report` — fetch scores and thresholds.
- `POST /v1/warroom/incidents` — open incidents for failed gates.

## Phase 4 — Engine Hardening
- **Goal**: Stabilize Toron kernels and memory safety.
- **Actions**:
  - Run extended sim-suite with strict invariants.
  - Enable ASAN/UBSAN equivalents in runtime builds.
  - Enforce determinism ≥98%; block drift via snapshot-compare.
- **Commands**: `make hardening PHASE=engine`, `python backend/ryuzen/engine/toron_v25hplus.py --validate --strict`.
- **Exit Criteria**: No crashes under fuzzed inputs; deterministic outputs across seeds.

## Phase 5 — Multi-Cloud Hardening
- **Goal**: Ensure portability across on-prem, AWS, GCP, Azure (offline synthetic data only).
- **Actions**:
  - Validate Terraform/Helm profiles in dry-run.
  - Verify artifact storage abstraction works with local blob emulator.
  - Run `cloud_hardening` script to ensure env parity.
- **Exit Criteria**: Identical deployment manifests; no provider-specific code paths.

## Phase 6 — Security + PII Hardening
- **Goal**: Meet security baselines and privacy mandates.
- **Actions**:
  - Enable PII scrubber; validate quarantine workflow.
  - Run SAST/DAST offline profiles; enforce SBOM diff.
  - Validate hashing scheme and telemetry compliance (see TELEMETRY_COMPLIANCE.md).
- **Commands**: `make security-hardening`, `python tools/pii_scrubber.py --dry-run logs/`.
- **Exit Criteria**: Zero unsanitized fields; SBOM drift ≤0.5%.

## Phase 7 — Load + Chaos
- **Goal**: Validate resilience under stress.
- **Actions**:
  - Execute offline chaos suite and k6 mock load.
  - Validate auto-recovery of Runner workers and SSE gateway reconnections.
  - Capture load_profiles.json and chaos incidents.
- **Exit Criteria**: No data loss; recovery <2 minutes; p95 latency within SLOs.

## Phase 8 — Controlled Beta Readiness
- **Goal**: Enable limited customer exposure with rollback safety.
- **Actions**:
  - Enable feature flags for beta cohort.
  - Run snapshot-compare on every build; enforce change-budget alerts.
  - Validate Warroom integration and incident templates.
- **Exit Criteria**: All gates green; rollback tested; documentation delivered to beta users.

## Phase 9 — Public Beta Readiness
- **Goal**: Broaden exposure with hardened operations.
- **Actions**:
  - Execute full CI pipeline plus extended regression and compliance audits.
  - Confirm telemetry compliance, PII scrubber metrics, and audit trails.
  - Perform go/no-go using `BETA_GO_NO_GO_CHECKLIST.md`.
- **Exit Criteria**: Zero critical incidents in last 7 days; performance SLOs met; stakeholder sign-off recorded.

## Troubleshooting
- **Phase slippage**: re-run preceding phase and refresh snapshots.
- **Unexpected cloud drift**: compare manifests in `reports/cloud_diff.txt`.
- **Telemetry red flag**: inspect quarantine queue depth and hashing logs.

## Upgrade Paths
- When adding new components, re-enter Phase 4 for engine changes or Phase 5 for infra changes.
- Maintain beta checklists updated; ensure deterministic baselines with every engine revision.

## Versioning Notes
- Phases map to milestone tags: `hardening-p4` ... `hardening-p9`.
- CI enforces phase gates via `hardening-suite` job in `.github/workflows/testops-ci.yml`.
