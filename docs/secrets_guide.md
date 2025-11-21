# Ryuzen Toron Secrets Management Guide

Enterprise deployments must keep all credentials outside the codebase and images. This guide outlines cloud-native approaches for AWS, GCP, and Azure.

## Core Principles
- Never commit secrets to Git or bake them into container images.
- Only decrypt values inside ToronEngine process memory; avoid writing decrypted bytes to disk.
- Prefer envelope encryption with KMS-backed keys; rotate keys and secrets regularly.
- Use workload identity (IRSA/Workload Identity/Pod Managed Identity) to eliminate static cloud credentials.
- Wipe decrypted values from memory after use via SecureMemory primitives where available.

## AWS (Secrets Manager + KMS + IRSA)
1. Enable IRSA on the EKS cluster and annotate the service account used by Toron.
2. Store secrets in AWS Secrets Manager. Example:
   ```bash
   aws secretsmanager create-secret \
     --name ryuzen/api-key \
     --secret-string '{"RYUZEN_API_KEY":"<value>","RYUZEN_MASTER_KEY":"<value>"}'
   ```
3. Grant decrypt permissions to the IAM role bound via `eks.amazonaws.com/role-arn`.
4. Mount secrets as environment variables using the Secrets Store CSI driver or fetch at startup with the AWS SDK.
5. Keys are encrypted with KMS; rotate regularly with `aws kms rotate-key` or automatic rotation policies.

## GCP (Secret Manager + CMEK + Workload Identity)
1. Enable Workload Identity and bind the Kubernetes service account to a Google service account.
2. Create a Secret Manager secret:
   ```bash
   gcloud secrets create ryuzen-api --replication-policy="automatic"
   echo -n "<value>" | gcloud secrets versions add ryuzen-api --data-file=-
   ```
3. Protect secrets with CMEK:
   ```bash
   gcloud kms keys create ryuzen-toron --keyring=platform --location=us --purpose=encryption
   gcloud secrets update ryuzen-api --kms-key projects/<project>/locations/us/keyRings/platform/cryptoKeys/ryuzen-toron
   ```
4. Mount with Secret Manager CSI driver or fetch dynamically inside the pod using application-level caching.

## Azure (Key Vault + Pod Managed Identity)
1. Enable workload identity on AKS and assign a user-assigned managed identity to the Toron service account.
2. Create and store secrets in Key Vault:
   ```bash
   az keyvault create --name ryuzenVault --resource-group platform
   az keyvault secret set --vault-name ryuzenVault --name RYUZEN-API-KEY --value <value>
   ```
3. Grant access to the managed identity:
   ```bash
   az keyvault set-policy --name ryuzenVault --object-id <client-id> --secret-permissions get list
   ```
4. Use CSI Secrets Store driver or SDK retrieval at runtime. Do not persist the values to disk; inject directly as env vars.

## Runtime Handling
- Store minimal configuration in Kubernetes secrets only as references to cloud secret identities, not the secret values themselves.
- For SSE/WebSocket flows, redact tokens from logs and traces; rely on OTEL attribute filters.
- Enforce periodic rotation by triggering CI jobs that call the respective cloud rotation APIs and restart deployments.
- Validate secrets at startup and fail fast when missing; never continue with blank defaults in production.
