# Ryuzen Toron v1.6 Secrets Management Guide

This guide describes production-grade patterns for handling secrets across AWS, GCP, and Azure. It enforces zero-knowledge operation for ToronEngine: no plaintext secrets in source control, images, or logs. All decryption must occur in-memory within the engine.

## Global Controls
- **No plaintext secrets in Git or Docker images.**
- **No secrets printed to logs** (including CI/CD). Mask environment variables in pipelines.
- Secrets decrypted **only inside ToronEngine** and wiped from memory after use.
- AES keys are stored in each cloud's native KMS and rotated regularly.
- Ephemeral, per-request keys are derived at runtime and never persisted.
- Rotation policies must be documented and calendared in this guide.
- Ensure GitHub Actions redact all secret environment variables (no echo).

---
## AWS (Secrets Manager + KMS + EKS IRSA)

**Architecture**
- Store secrets in AWS Secrets Manager using these paths:
  - `/ryuzen/engine/api-key`
  - `/ryuzen/engine/crypto/master-key`
  - `/ryuzen/engine/jwt-secret`
  - `/ryuzen/engine/connector/google`
  - `/ryuzen/engine/connector/microsoft`
- Master keys are encrypted with `aws_kms_key.ryuzen_master_key`.
- Pods authenticate with an **IRSA** service account annotated as:
  ```yaml
  metadata:
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::<acct>:role/ryuzen-sa
  ```
- Helm chart references Kubernetes secrets provisioned from Secrets Manager:
  ```yaml
  envFrom:
    - secretRef:
        name: ryuzen-secrets
  ```
- Never commit or template raw secret values.

**Rotation**
- Rotate `api-key` and `jwt-secret` every 90 days.
- Rotate `crypto/master-key` via KMS annually or on incident.
- Use Secrets Manager rotation lambdas with `Invocations` metrics monitored by CloudWatch.

---
## GCP (Secret Manager + Workload Identity + GKE)

**Architecture**
- Store all secrets in Google Secret Manager; mirror the AWS key names for parity.
- Bind the GKE service account to a Google IAM service account using Workload Identity:
  ```bash
gcloud iam service-accounts add-iam-policy-binding \
  <gcp-iam-sa>@<project>.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:<project>.svc.id.goog[ryuzen/engine]"
  ```
- Mount projected secrets into pods via Helm values:
  ```yaml
  secretVolume:
    projected:
      sources:
        - secret:
            name: ryuzen-secrets
  ```
- Rotate CMEK (Cloud KMS) keys periodically and re-encrypt stored secrets.

**Rotation**
- Rotate API keys and JWT secrets every 90 days; rotate CMEK annually.
- Use Secret Manager versioning; deprecate old versions after rollout completes.

---
## Azure (Key Vault + Pod Managed Identity + AKS)

**Architecture**
- Store secrets in Azure Key Vault with entries:
  - `ryuzen-api-key`
  - `ryuzen-crypto-key`
  - `ryuzen-jwt`
- Enable Managed Identity and bind pods via:
  ```yaml
  metadata:
    annotations:
      aadpodidentitybinding: ryuzen-identity
  ```
- Use the Secrets Store CSI Driver to sync Key Vault secrets into Kubernetes secrets consumed by the Helm chart.

**Rotation**
- Rotate Key Vault secrets every 90 days; regenerate crypto keys annually.
- Enable purge protection and soft-delete to prevent accidental loss.

---
## Zero-Knowledge Enforcement Checklist
- [ ] No secrets in application logs (enable structured redaction middleware).
- [ ] No secrets in CI logs; mask variables and disable command echoing.
- [ ] Secret volumes mounted with `readOnly: true`; avoid writing to disk.
- [ ] Secrets decrypted only inside ToronEngine request handlers.
- [ ] SecureMemory or equivalent used to wipe buffers after use.
- [ ] Short TTL for API keys; expired keys must be rejected server-side.
- [ ] Documented rotation calendar per cloud and owner.

