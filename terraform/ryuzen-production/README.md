# Ryuzen Production Infrastructure

Enterprise-grade AWS infrastructure for TORON epistemic AI engine and Ryuzen Workspace.

## Overview

This Terraform configuration deploys a fully managed, serverless infrastructure designed to scale from beta (10K queries/month) to enterprise (10M+ queries/month) without architectural changes.

### Key Features

- **Serverless Architecture**: AWS Lambda for compute, Aurora Serverless v2 for relational data
- **Multi-AZ High Availability**: Automatic failover across availability zones
- **Enterprise Security**: WAF, encryption at rest/transit, least-privilege IAM
- **Compliance Ready**: SOC2, GDPR, HIPAA, FedRAMP configurations
- **Cost Optimized**: Pay-per-use pricing, intelligent tiering for storage

## Quick Start

### Prerequisites

- Terraform >= 1.6.0
- AWS CLI configured with appropriate credentials
- S3 bucket for Terraform state (see Backend Setup)

### Deployment

```bash
# Initialize Terraform
cd terraform/ryuzen-production
terraform init

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### Backend Setup

Before first deployment, create the state bucket:

```bash
# Create S3 bucket for state
aws s3api create-bucket \
  --bucket ryuzen-terraform-state \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ryuzen-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for locking
aws dynamodb create-table \
  --table-name ryuzen-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## Architecture

```
                    Internet
                        │
                   Route 53
                        │
                    AWS WAF
                        │
              Application Load Balancer
                        │
         ┌──────────────┴──────────────┐
         │            VPC              │
         │  ┌──────────────────────┐   │
         │  │   Private Subnets    │   │
         │  │   ┌──────────────┐   │   │
         │  │   │    Lambda    │   │   │
         │  │   └──────────────┘   │   │
         │  └──────────────────────┘   │
         │                             │
         │  ┌──────────────────────┐   │
         │  │  Database Subnets    │   │
         │  │  ┌────────────────┐  │   │
         │  │  │ Aurora PostgreSQL │   │
         │  │  └────────────────┘  │   │
         │  └──────────────────────┘   │
         └─────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              │   AWS Services    │
              │  - DynamoDB       │
              │  - S3             │
              │  - Bedrock        │
              │  - Secrets Manager│
              └───────────────────┘
```

## Directory Structure

```
terraform/ryuzen-production/
├── main.tf                 # Root module orchestration
├── variables.tf            # Global variables
├── outputs.tf              # Global outputs
├── providers.tf            # AWS provider configuration
├── versions.tf             # Terraform version constraints
├── backend.tf              # Remote state configuration
│
├── environments/           # Environment-specific configurations
│   ├── production.tfvars
│   ├── staging.tfvars
│   ├── dev.tfvars
│   └── gov-cloud.tfvars
│
├── modules/                # Terraform modules
│   ├── networking/         # VPC, subnets, ALB, WAF
│   ├── compute/            # Lambda functions
│   ├── database/           # DynamoDB, Aurora
│   ├── storage/            # S3 buckets
│   ├── secrets/            # Secrets Manager, KMS
│   ├── monitoring/         # CloudWatch, X-Ray
│   ├── bedrock/            # AI model access
│   ├── dns/                # Route 53, ACM
│   ├── cdn/                # CloudFront
│   ├── security/           # WAF rules, Shield
│   ├── backup/             # AWS Backup
│   ├── disaster_recovery/  # DR configurations
│   └── compliance/         # Compliance controls
│
└── scripts/                # Deployment scripts
    ├── deploy.sh
    └── rollback.sh
```

## Environments

| Environment | Purpose | Cost Tier |
|-------------|---------|-----------|
| production  | Live traffic | Full HA, provisioned concurrency |
| staging     | Pre-production testing | Reduced capacity |
| dev         | Development | Minimal resources |
| gov-cloud   | Government contracts | FedRAMP compliant |

## Cost Estimates

| Component | Beta (10K/mo) | Scale (500K/mo) | Enterprise (10M/mo) |
|-----------|---------------|-----------------|---------------------|
| Lambda    | $15-30        | $100-200        | $500-1000          |
| Aurora    | $50-100       | $200-400        | $800-1500          |
| DynamoDB  | $2-5          | $20-50          | $200-500           |
| Networking| $50-80        | $100-150        | $300-500           |
| Storage   | $5-10         | $30-50          | $100-200           |
| **Total** | **$150-250**  | **$500-900**    | **$2000-4000**     |

## Security

- All data encrypted at rest (KMS)
- TLS 1.2+ for all connections
- WAF with rate limiting and DDoS protection
- VPC with private subnets (no direct internet access)
- Least-privilege IAM policies
- Secrets auto-rotation via Secrets Manager

## Compliance

Enabled by default:
- **SOC2**: Audit logging, access controls
- **GDPR**: Data retention, encryption

Optional:
- **HIPAA**: Enhanced logging, PHI controls
- **FedRAMP**: GovCloud deployment

## Monitoring

- CloudWatch dashboards for metrics
- X-Ray for distributed tracing
- CloudTrail for audit logging
- GuardDuty for threat detection
- SNS alerts for critical events

## Disaster Recovery

- Multi-AZ deployment
- Automated backups (30-day retention)
- Cross-region replication (optional)
- RPO: 1 hour / RTO: 4 hours

## Support

For issues or questions:
- Create an issue in this repository
- Contact: support@ryuzen.ai
