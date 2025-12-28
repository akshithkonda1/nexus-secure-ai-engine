#############################
# Ryuzen Production Environment
# Configuration Variables
#############################
#
# Deploy with: terraform apply -var-file=environments/production.tfvars
#
#############################

#---------------------------
# Environment
#---------------------------
environment    = "production"
name_prefix    = "ryuzen"
aws_region     = "us-east-1"
dr_region      = "us-west-2"
aws_account_id = "" # Set via environment variable or CLI

#---------------------------
# Networking
#---------------------------
vpc_cidr = "10.0.0.0/16"
availability_zones = [
  "us-east-1a",
  "us-east-1b"
]
enable_third_az       = false  # Enable for enhanced HA (additional cost)
enable_nat_gateway_ha = true   # One NAT per AZ for HA

#---------------------------
# Domain
#---------------------------
domain_name         = "ryuzen.ai"
api_subdomain       = "api"
workspace_subdomain = "app"
route53_zone_id     = "" # Set if zone exists
create_dns_zone     = false

#---------------------------
# Compute (Lambda)
#---------------------------
lambda_runtime = "python3.11"

# TORON Lambda - Higher resources for AI workloads
lambda_memory_toron           = 1024  # MB
lambda_timeout_toron          = 30    # seconds
provisioned_concurrency_toron = 5     # Always warm instances
reserved_concurrency_toron    = 100   # Max concurrent executions

# Workspace Lambda
lambda_memory_workspace           = 512
lambda_timeout_workspace          = 10
provisioned_concurrency_workspace = 2

enable_provisioned_concurrency = true  # Enable for production

#---------------------------
# Database
#---------------------------
# Aurora PostgreSQL Serverless v2
aurora_min_capacity     = 0.5   # Minimum ACUs (scales to zero equivalent)
aurora_max_capacity     = 16    # Maximum ACUs (auto-scale limit)
aurora_instance_count   = 2     # Multi-AZ (writer + reader)
aurora_backup_retention = 30    # Days

# DynamoDB
dynamodb_billing_mode         = "PAY_PER_REQUEST"  # On-demand pricing
enable_dynamodb_global_tables = false              # Enable for multi-region

# RDS Proxy
enable_rds_proxy = true  # Connection pooling for Lambda

#---------------------------
# Storage
#---------------------------
telemetry_retention_days          = 90    # GDPR compliance
backup_retention_days             = 2555  # 7 years for compliance
enable_s3_cross_region_replication = false
s3_force_destroy                  = false # Never allow force delete in production

#---------------------------
# Security
#---------------------------
enable_waf        = true
waf_rate_limit    = 2000  # Requests per 5 minutes per IP
waf_blocked_countries = []  # Add country codes to block if needed

enable_shield_advanced = false  # Enterprise DDoS ($3000/month)
enable_guardduty       = true
enable_security_hub    = true

kms_key_deletion_window = 30  # Days before KMS key deletion

#---------------------------
# Monitoring
#---------------------------
alarm_email          = "alerts@ryuzen.ai"
critical_alarm_phone = ""  # Optional: +1234567890
pagerduty_endpoint   = ""  # Optional: PagerDuty HTTPS endpoint
slack_webhook_url    = ""  # Optional: Slack webhook

log_retention_days  = 30
enable_xray_tracing = true
xray_sampling_rate  = 0.05  # 5% of requests

#---------------------------
# AI/ML (Bedrock)
#---------------------------
bedrock_models = [
  "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "anthropic.claude-3-haiku-20240307-v1:0",
  "meta.llama3-1-70b-instruct-v1:0",
  "meta.llama3-1-8b-instruct-v1:0",
  "mistral.mistral-large-2407-v1:0",
  "mistral.mistral-small-2402-v1:0",
  "amazon.titan-text-express-v1",
  "cohere.command-r-plus-v1:0"
]

external_api_providers = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "perplexity"
]

#---------------------------
# Compliance
#---------------------------
compliance_frameworks = ["SOC2", "GDPR"]
enable_hipaa          = false
enable_fedramp        = false

#---------------------------
# Disaster Recovery
#---------------------------
enable_dr    = false  # Enable for enhanced DR
dr_rpo_hours = 1      # Max 1 hour data loss
dr_rto_hours = 4      # Max 4 hours to recover

#---------------------------
# VPC Endpoints
#---------------------------
vpc_endpoint_services = [
  "secretsmanager",
  "bedrock-runtime"
]
enable_vpc_endpoint_cloudwatch = false  # Optional: saves NAT costs

#---------------------------
# Cost Optimization
#---------------------------
enable_cost_alerts           = true
monthly_budget_usd           = 500
daily_cost_anomaly_threshold = 100

#---------------------------
# Feature Flags
#---------------------------
features = {
  deploy_toron_lambda     = true
  deploy_workspace_lambda = true
  deploy_oauth_lambda     = true
  deploy_telemetry_lambda = true
  deploy_aurora           = true
  deploy_dynamodb         = true
  deploy_cloudfront       = false  # Enable when ready for CDN
  deploy_monitoring       = true
}

#---------------------------
# Additional Tags
#---------------------------
additional_tags = {
  LaunchDate = "2026-01-20"
  Product    = "TORON"
}
