# Multi-Provider Telemetry Deployment Guide

Complete deployment guide for upgrading Ryuzen Telemetry to support 11 TORON models across 4 cloud providers.

## Overview

This deployment upgrades the telemetry report generation system from single-provider (Claude Opus 4 only) to multi-provider support for:

- **AWS Bedrock** (8 models): Claude Sonnet 4.5, Claude Opus 4.5, Cohere Command R+, Llama 4 Maverick, Kimi K2 Thinking, DeepSeek R1, Mistral Large, Qwen3
- **OpenAI API** (1 model): ChatGPT 5.2
- **Google AI API** (1 model): Gemini 3
- **Perplexity API** (1 model): Perplexity Sonar

Each model analyzes **its own performance data** for authentic self-reflection reports.

## Prerequisites

Before deployment, ensure you have:

- [ ] AWS CLI configured with appropriate credentials
- [ ] Terraform v1.0+ installed
- [ ] AWS account with Bedrock model access enabled
- [ ] API keys for OpenAI, Google AI, and Perplexity
- [ ] IAM permissions to:
  - Create/update Secrets Manager secrets
  - Update IAM roles and policies
  - Deploy Terraform infrastructure
  - Push to ECR (for container updates)

## Step 1: Store API Keys in Secrets Manager

⚠️ **CRITICAL**: All API keys must be stored in AWS Secrets Manager before deployment.

### 1.1 OpenAI API Key

```bash
aws secretsmanager create-secret \
  --name ryuzen/telemetry/openai-api-key \
  --description "OpenAI API key for telemetry report generation" \
  --secret-string "YOUR_OPENAI_API_KEY_HERE" \
  --region us-east-1
```

### 1.2 Google AI API Key

```bash
aws secretsmanager create-secret \
  --name ryuzen/telemetry/google-api-key \
  --description "Google AI API key for telemetry report generation" \
  --secret-string "YOUR_GOOGLE_API_KEY_HERE" \
  --region us-east-1
```

### 1.3 Perplexity API Key

```bash
aws secretsmanager create-secret \
  --name ryuzen/telemetry/perplexity-api-key \
  --description "Perplexity API key for telemetry report generation" \
  --secret-string "YOUR_PERPLEXITY_API_KEY_HERE" \
  --region us-east-1
```

### 1.4 Verify Secrets Created

```bash
aws secretsmanager list-secrets \
  --filters Key=name,Values=ryuzen/telemetry/ \
  --region us-east-1
```

You should see all three secrets listed.

## Step 2: Enable AWS Bedrock Model Access

⚠️ **IMPORTANT**: Request access to all required Bedrock models before deployment.

### 2.1 Navigate to Bedrock Console

```
AWS Console > Bedrock > Model access
```

### 2.2 Request Access for These Models

- ✅ **Anthropic**: Claude Sonnet 4.5, Claude Opus 4.5
- ✅ **Cohere**: Command R+
- ✅ **Meta**: Llama 4 Maverick
- ✅ **Kimi**: K2 Thinking
- ✅ **DeepSeek**: R1
- ✅ **Mistral**: Mistral Large
- ✅ **Qwen**: Qwen 3

### 2.3 Verify Model Access

```bash
aws bedrock list-foundation-models \
  --region us-east-1 \
  --query 'modelSummaries[?contains(modelId, `anthropic`) || contains(modelId, `cohere`) || contains(modelId, `meta`) || contains(modelId, `kimi`) || contains(modelId, `deepseek`) || contains(modelId, `mistral`) || contains(modelId, `qwen`)].modelId' \
  --output table
```

## Step 3: Deploy Terraform Infrastructure

### 3.1 Navigate to Terraform Directory

```bash
cd telemetry/terraform
```

### 3.2 Initialize Terraform (if not already done)

```bash
terraform init
```

### 3.3 Plan the Changes

```bash
terraform plan -out=multi-provider.tfplan
```

**Review the plan carefully.** You should see:
- IAM policy updates for `ryuzen-bundle-task-policy`
- Two new IAM statements:
  - `ReadAPIKeysFromSecretsManager`
  - `InvokeBedrockModels`

### 3.4 Apply the Changes

```bash
terraform apply multi-provider.tfplan
```

**Expected output:**
```
aws_iam_policy.bundle_task: Modifying...
aws_iam_policy.bundle_task: Modifications complete

Apply complete! Resources: 0 added, 1 changed, 0 destroyed.
```

### 3.5 Verify IAM Policy Updated

```bash
aws iam get-policy-version \
  --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/ryuzen-bundle-task-policy \
  --version-id $(aws iam get-policy --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/ryuzen-bundle-task-policy --query Policy.DefaultVersionId --output text) \
  --query PolicyVersion.Document.Statement[?Sid==\'ReadAPIKeysFromSecretsManager\']
```

Should return the Secrets Manager statement.

## Step 4: Update Python Dependencies

### 4.1 Update Requirements in Container

The `requirements.txt` has been updated with:
- `anthropic>=0.39.0` (updated from 0.18.0)
- `openai>=1.54.0` (updated from 1.10.0)
- `google-generativeai>=0.8.3` (new)
- `requests>=2.31.0` (new)

### 4.2 Rebuild Container Image

```bash
cd ../../  # Back to project root

# Build new container image
docker build -t ryuzen-telemetry-bundle:latest -f telemetry/Dockerfile .

# Tag for ECR
docker tag ryuzen-telemetry-bundle:latest \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/ryuzen-telemetry-bundle:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# Push to ECR
docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/ryuzen-telemetry-bundle:latest
```

## Step 5: Verify Deployment

### 5.1 Run Verification Script

```bash
cd telemetry
bash scripts/verify_multi_provider.sh
```

This script checks:
- ✅ AWS credentials configured
- ✅ Bedrock models accessible
- ✅ Secrets exist in Secrets Manager
- ✅ Python dependencies installed
- ✅ IAM permissions correct

### 5.2 Test Report Generation (Optional)

You can test a single model report generation:

```bash
python -c "
from telemetry.bundles.report_generator import get_report_generator
from telemetry.bundles.model_routing_config import list_supported_models

generator = get_report_generator()
models = list_supported_models()
print(f'Configured models: {models}')
print(f'Total: {len(models)} models')
"
```

**Expected output:**
```
Configured models: ['ChatGPT-5.2', 'Claude-Opus-4.5', 'Claude-Sonnet-4.5', 'Cohere-Command-R-Plus', 'DeepSeek-R1', 'Google-Gemini-3', 'Kimi-K2-Thinking', 'Meta-Llama-4', 'Mistral-Large', 'Perplexity-Sonar', 'Qwen3']
Total: 11 models
```

## Step 6: Deploy to Production

### 6.1 Update ECS Task Definition

If using ECS Fargate for bundle generation:

```bash
cd telemetry/terraform
terraform apply -target=aws_ecs_task_definition.bundle_task -auto-approve
```

### 6.2 Force New Deployment

```bash
aws ecs update-service \
  --cluster ryuzen-telemetry-cluster \
  --service bundle-generator \
  --force-new-deployment \
  --region us-east-1
```

### 6.3 Monitor Deployment

```bash
aws ecs describe-services \
  --cluster ryuzen-telemetry-cluster \
  --services bundle-generator \
  --region us-east-1 \
  --query 'services[0].deployments'
```

Wait until `runningCount` matches `desiredCount` for the new deployment.

## Step 7: Test End-to-End Bundle Generation

### 7.1 Trigger a Test Bundle

```bash
# Trigger bundle generation for current month
aws lambda invoke \
  --function-name ryuzen-monthly-bundle-trigger \
  --payload '{"partner": "test-partner", "month": "2025-01"}' \
  --region us-east-1 \
  response.json

cat response.json
```

### 7.2 Check CloudWatch Logs

```bash
aws logs tail /aws/ecs/ryuzen-bundle-task --follow --region us-east-1
```

Look for:
- ✅ "Routing {model_name} to {provider}"
- ✅ "Generated report for {model_name}: {N} characters"
- ✅ "Added report: reports/{model_name}_analysis.md"

### 7.3 Download and Inspect Bundle

```bash
# List bundles in S3
aws s3 ls s3://ryzn-partner-bundles/test-partner/2025-01/ --region us-east-1

# Download latest bundle
aws s3 cp s3://ryzn-partner-bundles/test-partner/2025-01/bundle.zip ./test-bundle.zip --region us-east-1

# Extract and inspect
unzip test-bundle.zip -d test-bundle/
ls -la test-bundle/reports/
```

You should see reports for all models present in the telemetry data.

## Success Criteria Checklist

Deployment is complete when all these criteria are met:

- [ ] All 3 API keys stored in Secrets Manager
- [ ] All 8 Bedrock models have access granted
- [ ] Terraform apply completed successfully
- [ ] IAM permissions include Secrets Manager and Bedrock access
- [ ] Container rebuilt and pushed to ECR
- [ ] Dependencies installed and importable
- [ ] Verification script passes all checks
- [ ] Test bundle generates successfully
- [ ] All model reports appear in bundle ZIP
- [ ] Each report is 2000+ words
- [ ] Manifest lists all generated reports
- [ ] CloudWatch shows no errors
- [ ] Production deployment successful

## Troubleshooting

### Issue: "Access Denied" for Secrets Manager

**Cause**: IAM role doesn't have Secrets Manager permissions

**Fix**: Verify Terraform applied correctly:
```bash
cd telemetry/terraform
terraform plan  # Should show no changes if applied correctly
```

### Issue: "Model access denied" for Bedrock

**Cause**: Bedrock model access not granted

**Fix**:
1. Go to AWS Console > Bedrock > Model access
2. Request access for the specific model
3. Wait for approval (usually instant for most models)

### Issue: "Module not found: google.generativeai"

**Cause**: Dependencies not installed in container

**Fix**: Rebuild and push container (Step 4.2)

### Issue: Reports using fallback model

**Cause**: Model name in telemetry data doesn't match routing config

**Fix**: Check actual model names in data:
```bash
# Query telemetry data for actual model names
python -c "
import pandas as pd
import boto3
import io

s3 = boto3.client('s3')
obj = s3.get_object(Bucket='ryzn-analytics', Key='analytics/2025-01/data.parquet')
df = pd.read_parquet(io.BytesIO(obj['Body'].read()))
print(df['model_name'].unique())
"
```

Then update `model_routing_config.py` aliases if needed.

### Issue: API rate limits exceeded

**Cause**: Too many concurrent API calls

**Fix**: The report generator runs sequentially, but if multiple bundles are generated simultaneously, rate limits may be hit. Consider:
- Adding retry logic with exponential backoff
- Staggering bundle generation times
- Requesting higher rate limits from providers

## Rollback Procedure

If deployment fails and you need to rollback:

### 1. Revert Terraform Changes

```bash
cd telemetry/terraform
git checkout HEAD~1 iam_roles.tf
terraform apply -auto-approve
```

### 2. Revert Code Changes

```bash
cd ../..
git checkout HEAD~1 telemetry/bundles/report_generator.py
git checkout HEAD~1 telemetry/bundles/model_routing_config.py
git checkout HEAD~1 requirements.txt
```

### 3. Rebuild and Deploy Previous Container

```bash
docker build -t ryuzen-telemetry-bundle:previous -f telemetry/Dockerfile .
# Push and deploy as in Step 4.2
```

## Support and Monitoring

### CloudWatch Metrics

Monitor these metrics in CloudWatch:

- `BundleGeneration/Success` - Should be 1 for successful generations
- `BundleGeneration/RecordCount` - Number of telemetry records processed
- `BundleGeneration/ReportsGenerated` - Should be 11 (or number of models with data)

### CloudWatch Logs

Key log groups:
- `/aws/ecs/ryuzen-bundle-task` - Bundle generation logs
- `/aws/lambda/ryuzen-monthly-scheduler` - Scheduler logs

### Alarms

Consider creating CloudWatch Alarms for:
- Bundle generation failures
- Report generation errors
- API throttling errors
- Secrets Manager access failures

## Next Steps

After successful deployment:

1. **Monitor first production bundle** - Check quality of generated reports
2. **Review model reports** - Ensure each model is analyzing itself correctly
3. **Adjust routing if needed** - Update `model_routing_config.py` for any model name variations
4. **Set up alerting** - Create CloudWatch Alarms for failures
5. **Document model names** - Keep a reference of exact model name strings from TORON

## Additional Resources

- [TORON Model Documentation](../docs/TORON_MODELS.md)
- [Telemetry Schema](../schema/telemetry_schema.py)
- [Report Generator API](../bundles/report_generator.py)
- [Model Routing Config](../bundles/model_routing_config.py)

## Questions?

For issues or questions about this deployment:
1. Check CloudWatch logs for specific errors
2. Run verification script for diagnostic information
3. Review this guide's troubleshooting section
4. Contact the Ryuzen development team

---

**Deployment Status**: Ready for production ✅

**Last Updated**: 2025-12-23

**Version**: 2.0 (Multi-Provider)
