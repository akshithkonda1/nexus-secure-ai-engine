# Ryuzen Telemetry System

Ryuzen Telemetry is a neutral, PII-free telemetry pipeline used by model providers to analyze the performance of their own models. It captures runtime metrics and delivery outcomes but never processes user chat data. Telemetry is short-lived and removed after partner bundle delivery to keep the footprint minimal.

## Data Flow
1. **API Gateway → ingest_handler → RAW S3**: Ingestion Lambda receives telemetry events and stores them in the encrypted RAW bucket.
2. **sanitize_handler → SANITIZED S3 + Zero-PII certificate**: Events are validated and scrubbed; bad payloads are copied to quarantine.
3. **analytics_handler → ANALYTICS S3 (Parquet)**: Sanitized data is normalized and partitioned for Athena/Glue and downstream analytics.
4. **bundle_builder (ECS Fargate) → partner bundle ZIP**: Monthly bundles combine Parquet partitions, manifests, and zero-PII certificates.
5. **s3_delivery → partner S3 path + presigned URL**: Bundles are placed in the partner bucket and delivered through pre-signed URLs.
6. **delete_old_telemetry → removes RAW/SANITIZED/ANALYTICS for that month**: Cleanup Lambda deletes telemetry objects once delivery is confirmed.
7. **User chat DB**: External system, not part of this repository or infrastructure.

## Privacy & Deletion
- Telemetry is not retained long term; RAW data expires within hours and SANITIZED/ANALYTICS objects are cleaned after bundle delivery.
- User chat transcripts are **never** included in telemetry and live in a separate service.
- Scrubbing is performed before any bundle is produced, and Zero-PII certification artifacts are packaged with the partner bundle.

## Audit & Compliance
- **TelemetryAudit DynamoDB table** records pipeline events.
- Logged events include `BUNDLE_CREATED`, `BUNDLE_DELIVERED`, `TELEMETRY_DELETED`, `SCRUB_VIOLATION`, and `ERROR`.
- Use `audit_query.py` (in the telemetry tooling package) to query recent events or filter by partner/month.

## Architecture Diagram
```
[Client Models] -> API GW -> Lambda (ingest)
                   |
                 S3 RAW
                   |
             Lambda (sanitize) -> S3 SANITIZED -> Lambda (analytics) -> S3 ANALYTICS
                                                             |
                                                       ECS Fargate (bundle gen)
                                                             |
                                                        S3 PARTNER BUNDLES
                                                             |
                                                 Partner downloads + internal analysis
                                                             |
                                    Lambda delete_old_telemetry -> delete RAW/SAN/S3 ANALYTICS
```

## Getting Started
1. **Deploy Terraform**
   - Set AWS credentials and region (defaults to `us-east-1`).
   - Run `terraform init` and `terraform apply` from `telemetry/terraform`.
2. **Configure environment variables**
   - Lambda environment variables are wired to the created buckets and audit table: `RAW_BUCKET`, `SANITIZED_BUCKET`, `ANALYTICS_BUCKET`, `QUARANTINE_BUCKET`, `AUDIT_TABLE`.
   - Provide Lambda zip artifacts via the `*_handler_package` variables or update the task definition image for bundle generation.
3. **Onboard a new partner**
   - Provision partner-specific prefixes under the partner bundle bucket.
   - Configure the bundle builder to emit manifests and certificates for the partner namespace.
   - Distribute pre-signed URLs or delegated access for the partner bundle prefix.
