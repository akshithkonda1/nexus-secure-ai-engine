# Ryuzen Architecture Decision Records

## ADR-001: Serverless-First Architecture

### Context
Ryuzen needs infrastructure that scales from 0 to millions of requests while minimizing operational overhead and costs.

### Decision
Use AWS Lambda for all compute workloads with Aurora Serverless v2 for relational data.

### Rationale
- **Cost**: Pay only for actual usage (critical for bootstrap phase)
- **Scaling**: Automatic scaling from 0 to thousands of concurrent executions
- **Operations**: No server management, patching, or capacity planning
- **Speed**: Focus on product, not infrastructure

### Consequences
- Cold start latency (mitigated with provisioned concurrency)
- 15-minute execution limit (acceptable for our workloads)
- VPC attachment adds ~1s cold start

---

## ADR-002: Dual Database Strategy

### Context
TORON requires both fast key-value cache access and complex relational queries.

### Decision
Use DynamoDB for caching (Tier 1 & 3) and Aurora PostgreSQL for user/transactional data.

### Rationale
- **DynamoDB**: Single-digit millisecond latency, infinite scale, built-in TTL
- **Aurora**: SQL flexibility for user management, OAuth, analytics
- **Separation**: Different workloads, different optimization strategies

### Consequences
- Two database systems to manage
- Data consistency must be handled at application layer
- Higher operational complexity

---

## ADR-003: VPC with Private Subnets

### Context
Enterprise customers and compliance frameworks require network isolation.

### Decision
Deploy all compute and databases in private subnets with no direct internet access.

### Rationale
- **Security**: Defense in depth, reduced attack surface
- **Compliance**: Required for SOC2, HIPAA, FedRAMP
- **Enterprise**: Expected by Fortune 500 buyers

### Consequences
- NAT Gateway costs (~$32/month per AZ)
- VPC endpoint costs for AWS services
- Added latency for external API calls

---

## ADR-004: Multi-AZ by Default

### Context
Production services must maintain high availability for enterprise SLAs.

### Decision
Deploy across minimum 2 AZs with automatic failover.

### Rationale
- **Availability**: Survive single AZ failure
- **SLA**: Required for 99.9% uptime
- **Enterprise**: Expected baseline capability

### Consequences
- 2x NAT Gateway costs
- Cross-AZ data transfer costs
- More complex networking configuration

---

## ADR-005: KMS Customer-Managed Keys

### Context
Compliance requires encryption at rest with audit capability.

### Decision
Use customer-managed KMS keys for all encryption.

### Rationale
- **Compliance**: Required for HIPAA, FedRAMP
- **Audit**: CloudTrail logs all key usage
- **Control**: Can revoke access immediately

### Consequences
- KMS costs ($1/key/month + usage)
- Key rotation management
- Cross-account access complexity

---

## ADR-006: Provisioned Concurrency for Production

### Context
Cold starts impact user experience for the first request.

### Decision
Use provisioned concurrency for production Lambda functions.

### Rationale
- **Performance**: Eliminate cold starts for 95%+ of requests
- **SLA**: Required for <4s P95 latency target
- **Cost**: ~$50-100/month for consistent performance

### Consequences
- Fixed cost regardless of traffic
- Must tune based on traffic patterns
- Requires deployment coordination

---

## ADR-007: WAF for All Traffic

### Context
Public APIs are targets for abuse and attacks.

### Decision
Deploy AWS WAF on ALB with rate limiting and managed rules.

### Rationale
- **Security**: Block common attacks (SQLi, XSS)
- **Availability**: Rate limiting prevents abuse
- **Cost**: ~$6-8/month for significant protection

### Consequences
- Potential false positives blocking legitimate traffic
- Additional latency (minimal)
- Rule tuning required

---

## ADR-008: CloudTrail for Audit

### Context
Compliance requires audit trail of all API activity.

### Decision
Enable CloudTrail for all regions with log file validation.

### Rationale
- **Compliance**: Required for SOC2, HIPAA, FedRAMP
- **Security**: Detect unauthorized access
- **Forensics**: Investigate incidents

### Consequences
- S3 storage costs for logs
- Must retain for 7 years (compliance)
- Log analysis requires additional tooling

---

## ADR-009: RDS Proxy for Lambda

### Context
Lambda creates new database connections per invocation, potentially exhausting connection limits.

### Decision
Use RDS Proxy for all Lambda-to-Aurora connections.

### Rationale
- **Scaling**: Support thousands of concurrent Lambdas
- **Performance**: Connection pooling reduces latency
- **Reliability**: Automatic failover handling

### Consequences
- ~$11/month additional cost
- IAM authentication required
- Slightly increased latency for first connection

---

## ADR-010: No Kubernetes (Yet)

### Context
Team debated between Lambda and EKS for compute.

### Decision
Use Lambda exclusively; no Kubernetes.

### Rationale
- **Simplicity**: Solo founder, no DevOps team
- **Cost**: EKS control plane is $73/month before workloads
- **Scale**: Lambda handles our workloads effectively
- **Focus**: Product development over infrastructure management

### Consequences
- Limited to 15-minute execution times
- Cannot run long-running services (acceptable)
- May need to revisit at massive scale

---

## Technology Choices Summary

| Component | Choice | Alternative Considered | Reason |
|-----------|--------|----------------------|--------|
| Compute | Lambda | ECS Fargate, EKS | Simplicity, cost |
| Relational DB | Aurora Serverless v2 | RDS PostgreSQL | Auto-scaling |
| Cache | DynamoDB | ElastiCache Redis | Serverless, simpler |
| CDN | CloudFront | Cloudflare | AWS integration |
| DNS | Route 53 | Cloudflare | AWS integration |
| Secrets | Secrets Manager | SSM Parameter Store | Rotation support |
| IaC | Terraform | CDK, CloudFormation | Multi-cloud ready |
