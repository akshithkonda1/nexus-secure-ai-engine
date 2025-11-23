# Ryuzen Security Model (v1.6)

## Encryption
- AES-256-GCM for all requests in/out.
- No plaintext stored, logged, or cached.
- Ephemeral key derivation possible.

## PII Policy
- All PII removed client-side *before* encryption.
- Backend PII pipeline ensures zero sensitive data reaches any model provider.
- Enterprise mode allows custom PII rules.

## Data Retention
- No logs of requests.
- No caching of prompts.
- Telemetry stores **only performance metrics**.

## Threat Model
- Prevent prompt injection via sanitization.
- Detect LLM hallucinations via Toron consensus.
- Protect users from data leakage.
- Defend models from malicious request flooding.
