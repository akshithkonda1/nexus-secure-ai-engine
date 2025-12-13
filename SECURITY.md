# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| main    | Yes      |
| tags    | Yes      |

All production deployments must track the latest tagged release and incorporate security patches within 7 days of publication.

## Reporting a vulnerability

1. Email `security@nexus.ai` with the subject `SECURITY DISCLOSURE`.
2. Provide a proof of concept, impact assessment, and any relevant logs. Encrypt mail using the PGP key published at `https://nexus.ai/security-pgp.txt` when possible.
3. Expect an acknowledgement within 24 hours and a triage update within 3 business days.

## Coordinated disclosure timeline

| Phase | SLA |
|-------|-----|
| Acknowledgement | 24 hours |
| Initial triage | 3 business days |
| Fix available | 14 days for critical, 30 days for high |
| Public disclosure | Mutually agreed after fix |

## Hardening checklist

- All production gateways must set `NEXUS_RATE_LIMIT_STORAGE_URL` to a persistent backend (Redis/Memcached).
- Configure TLS termination with certificates that renew automatically.
- Rotate `AUTHORIZED_API_KEYS` at least every 90 days and audit usage via `/audit` exports.
- Deny outbound network access except to approved search providers and model endpoints.
- Enable audit log streaming to your SIEM and monitor for anomalous rate-limit rejections.

## Dependency management

The GitHub Actions CI pipeline runs `pip-audit` and `bandit` on every pull request. Releases are blocked until both checks pass. SBOM generation can be layered on top by running `pip install cyclonedx-bom` and executing `cyclonedx-py -r requirements.txt`.
