# Ryuzen Operations Runbook

## Common Operations

### Deploy New Lambda Code

```bash
# 1. Build and upload to S3
aws s3 cp lambda-package.zip s3://ryuzen-artifacts-ACCOUNT_ID/functions/toron-query-handler.zip

# 2. Update Lambda to use new code
aws lambda update-function-code \
  --function-name ryuzen-production-toron-query-handler \
  --s3-bucket ryuzen-artifacts-ACCOUNT_ID \
  --s3-key functions/toron-query-handler.zip

# 3. Publish new version
aws lambda publish-version \
  --function-name ryuzen-production-toron-query-handler

# 4. Update alias to point to new version
aws lambda update-alias \
  --function-name ryuzen-production-toron-query-handler \
  --name live \
  --function-version NEW_VERSION
```

### Check Lambda Logs

```bash
# Real-time logs
aws logs tail /aws/lambda/ryuzen-production-toron-query-handler --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/ryuzen-production-toron-query-handler \
  --filter-pattern "ERROR"
```

### Database Maintenance

```bash
# Connect to Aurora via proxy
psql "host=ryuzen-production-proxy.proxy-xxx.us-east-1.rds.amazonaws.com \
      dbname=ryuzen user=ryuzen_admin sslmode=require"

# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

# Vacuum (run during low traffic)
VACUUM ANALYZE;
```

### Clear DynamoDB Cache

```bash
# Clear Tier 1 cache (careful - this affects all users!)
aws dynamodb scan \
  --table-name ryuzen-production-tier1-cache \
  --projection-expression "prompt_hash" | \
  jq -r '.Items[].prompt_hash.S' | \
  xargs -I {} aws dynamodb delete-item \
    --table-name ryuzen-production-tier1-cache \
    --key '{"prompt_hash": {"S": "{}"}}'
```

---

## Incident Response

### High Error Rate

**Symptoms**: CloudWatch alarm fires, 5XX errors increasing

**Steps**:
1. Check Lambda logs for error messages
2. Check RDS connections and CPU
3. Check DynamoDB throttling
4. Check external API status (OpenAI, etc.)

```bash
# Quick health check
aws lambda invoke \
  --function-name ryuzen-production-toron-query-handler \
  --payload '{"action": "health_check"}' \
  response.json
cat response.json
```

### Database Connection Issues

**Symptoms**: Lambda timeouts, "connection refused" errors

**Steps**:
1. Check RDS Proxy connections
2. Check security group rules
3. Check database credentials in Secrets Manager

```bash
# Check RDS Proxy status
aws rds describe-db-proxy-targets \
  --db-proxy-name ryuzen-production-proxy

# Check database connections
aws cloudwatch get-metric-data \
  --metric-data-queries '[{
    "Id": "connections",
    "MetricStat": {
      "Metric": {
        "Namespace": "AWS/RDS",
        "MetricName": "DatabaseConnections"
      },
      "Period": 60,
      "Stat": "Maximum"
    }
  }]' \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ)
```

### Lambda Throttling

**Symptoms**: 429 errors, "Rate exceeded" in logs

**Steps**:
1. Check concurrent execution count
2. Increase reserved concurrency
3. Enable request queuing if needed

```bash
# Check current concurrency
aws lambda get-function-concurrency \
  --function-name ryuzen-production-toron-query-handler

# Increase reserved concurrency
aws lambda put-function-concurrency \
  --function-name ryuzen-production-toron-query-handler \
  --reserved-concurrent-executions 200
```

### DynamoDB Throttling

**Symptoms**: "ProvisionedThroughputExceededException"

**Steps**:
1. Check consumed capacity vs provisioned
2. Switch to on-demand if needed
3. Add read replicas if read-heavy

```bash
# Check table status
aws dynamodb describe-table \
  --table-name ryuzen-production-tier1-cache

# Switch to on-demand billing
aws dynamodb update-table \
  --table-name ryuzen-production-tier1-cache \
  --billing-mode PAY_PER_REQUEST
```

---

## Scaling Operations

### Scale Provisioned Concurrency

```bash
# Increase for expected traffic spike
aws lambda put-provisioned-concurrency-config \
  --function-name ryuzen-production-toron-query-handler \
  --qualifier live \
  --provisioned-concurrent-executions 20
```

### Scale Aurora

Aurora Serverless v2 scales automatically, but you can adjust limits:

```bash
# Check current capacity
aws rds describe-db-clusters \
  --db-cluster-identifier ryuzen-production-postgres

# Adjust max capacity via Terraform (preferred)
# Or update serverless scaling config directly
```

---

## Backup & Recovery

### Manual Database Snapshot

```bash
aws rds create-db-cluster-snapshot \
  --db-cluster-identifier ryuzen-production-postgres \
  --db-cluster-snapshot-identifier manual-snapshot-$(date +%Y%m%d)
```

### Restore from Snapshot

```bash
# List available snapshots
aws rds describe-db-cluster-snapshots \
  --db-cluster-identifier ryuzen-production-postgres

# Restore (creates new cluster)
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier ryuzen-production-postgres-restored \
  --snapshot-identifier snapshot-id \
  --engine aurora-postgresql
```

### Point-in-Time Recovery

```bash
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier ryuzen-production-postgres \
  --db-cluster-identifier ryuzen-production-postgres-pitr \
  --restore-to-time 2024-01-15T10:00:00Z
```

---

## Security Operations

### Rotate API Keys

```bash
# Get current secret
aws secretsmanager get-secret-value \
  --secret-id ryuzen/production/api-keys/openai

# Update secret with new key
aws secretsmanager update-secret \
  --secret-id ryuzen/production/api-keys/openai \
  --secret-string '{"api_key": "NEW_KEY"}'
```

### Rotate Database Password

```bash
# Trigger rotation
aws secretsmanager rotate-secret \
  --secret-id ryuzen/production/db-credentials \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:ACCOUNT:function:rotation
```

### Review Security Findings

```bash
# GuardDuty findings
aws guardduty list-findings \
  --detector-id DETECTOR_ID

# Security Hub findings
aws securityhub get-findings \
  --filters '{"SeverityLabel": [{"Value": "CRITICAL", "Comparison": "EQUALS"}]}'
```

---

## Monitoring Queries

### Lambda Performance

```bash
# P95 latency over last hour
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=ryuzen-production-toron-query-handler \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 300 \
  --statistics p95
```

### Daily Query Count

```bash
# Invocation count
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=ryuzen-production-toron-query-handler \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 86400 \
  --statistics Sum
```

### Cost Tracking

```bash
# Lambda costs (last 7 days)
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d '7 days ago' +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity DAILY \
  --filter '{"Dimensions": {"Key": "SERVICE", "Values": ["AWS Lambda"]}}' \
  --metrics UnblendedCost
```

---

## Contacts

- **On-Call**: PagerDuty (via SNS)
- **Engineering**: engineering@ryuzen.ai
- **Security**: security@ryuzen.ai
