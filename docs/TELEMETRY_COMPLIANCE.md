# Telemetry Compliance

## Purpose
Ensure telemetry emitted by TestOps and Toron v2.5H+ meets PII, GDPR, and FedRAMP-aligned controls while operating offline.

## Architecture
- **PII Scrubber**: inline sanitizer with regex + ML heuristics.
- **Hashing Scheme**: SHA-256 with rotating salt; stored alongside salt-version headers.
- **Quarantine Cycle**: isolates suspicious payloads, re-scrubs, and requires approval.
- **Export Pipeline**: writes sanitized telemetry to local sinks only; no external calls.

### Telemetry Flow
```
[Engine Metrics] -> [PII Scrubber] -> [Hasher] -> [Quarantine?] -> [Local Sink]
                                      |                          |
                               [Salt Rotation]            [Compliance Reports]
```

## Component Interaction
1. Engine emits metrics; Scrubber masks PII fields.
2. Hasher applies salt; payload annotated with salt version.
3. Quarantine workflow intercepts suspicious payloads before sink.
4. Compliance reports summarize status for Warroom review.

## API References
- `POST /v1/telemetry/ingest` — receive metrics with offline validation.
- `GET /v1/telemetry/quarantine` — list quarantined payloads.
- `POST /v1/telemetry/quarantine/{id}/approve` — release after scrub.
- `GET /v1/telemetry/reports/{framework}` — generate GDPR/FedRAMP summaries.

## Command Examples
- `python telemetry/run_scrubber.py --input logs/ --output telemetry/clean/`.
- `python telemetry/quarantine_review.py --approve --id <case>`.
- `python telemetry/hash_rotate.py --salt-version 2024-09`.
- `python telemetry/compliance_report.py --framework gdpr --out reports/telemetry_gdpr.md`.

## Troubleshooting
- **High quarantine rate**: tune patterns in `telemetry/policy.yaml`; verify synthetic data shapes.
- **Hash collisions**: ensure salt version updated; check `telemetry/hash_log.json`.
- **Export blocked**: confirm local sink writable and offline policy set to `strict`.

## Upgrade Paths
- When adding new telemetry fields, update schema and scrubber masks.
- Re-run compliance reports after any salt rotation.
- Validate quarantine workflow during hardening Phases 6 and 8.

## Versioning Notes
- Policy versions tracked in `telemetry/policy_version.txt`.
- Salt rotations recorded in `telemetry/hash_log.json` and release notes.
