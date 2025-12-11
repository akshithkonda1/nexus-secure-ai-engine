# Security and PII Handling Guide

## Purpose
Provide actionable security controls and PII handling standards for TestOps and Toron v2.5H+.

## Architecture
- **AuthN/Z**: OIDC-compatible offline provider; RBAC for roles (operator, maintainer, security).
- **PII Scrubber**: streaming sanitizer applied to logs, telemetry, and snapshots.
- **Quarantine Queue**: isolates suspect payloads until scrubbed.
- **Audit Trail**: immutable log of access, snapshot diffs, and incident changes.

### Data Protection Flow
```
[Input] -> [API Validation] -> [PII Scrubber] -> [Snapshot/Telemetry]
                                 |                     |
                          [Quarantine Queue]      [Audit Trail]
```

## Component Interaction
1. API validates payloads and enforces RBAC.
2. PII Scrubber masks sensitive fields; suspicious payloads quarantined.
3. Audit trail records every action; Warroom notified on violations.

## API References
- `POST /v1/auth/token` — offline token issuance.
- `POST /v1/pii/scrub` — sanitize payloads.
- `POST /v1/quarantine/release` — approve cleaned records.
- `GET /v1/audit/logs` — retrieve immutable audit slices.

## PII Controls
- Deterministic hashing for identifiers (SHA-256 + salt rotation every 30 days).
- Redaction masks for names/emails/IDs before storage.
- Quarantine if regex or ML classifier flags unsanitized content; manual release required.

## Command Examples
- `python tools/pii_scrubber.py --scan logs/ --quarantine quarantine/`.
- `python tools/quarantine_release.py --id <case>`.
- `python tools/hash_rotate.py --salt-version 2024-09`.

## Troubleshooting
- **False positives**: whitelist pattern in `config/pii_allowlist.yaml` and re-run scrubber.
- **Hash mismatch**: ensure salt version matches telemetry headers.
- **Audit gaps**: verify log shipping to `observability/audit/` is enabled.

## Upgrade Paths
- Rotate salts quarterly; update telemetry consumers.
- Refresh classifier models with synthetic labeled data; keep offline.
- Re-validate quarantine workflow during hardening Phase 6.

## Versioning Notes
- PII policy version tracked in `telemetry/policy_version.txt` and referenced in releases.
