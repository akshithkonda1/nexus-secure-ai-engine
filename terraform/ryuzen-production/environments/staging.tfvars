#############################
# Ryuzen Staging Environment
# Configuration Variables
#############################
#
# Deploy with: terraform apply -var-file=environments/staging.tfvars
#
# Staging mirrors production configuration but with:
# - Reduced capacity (lower costs)
# - No provisioned concurrency (accept cold starts)
# - Shorter retention periods
# - Force destroy enabled for cleanup
#
#############################

#---------------------------
# Environment
#---------------------------
environment    = "staging"
name_prefix    = "ryuzen"
aws_region     = "us-east-1"
dr_region      = "us-west-2"
aws_account_id = "" # Set via environment variable or CLI

#---------------------------
# Networking
#---------------------------
vpc_cidr = "10.1.0.0/16"  # Different CIDR from production
availability_zones = [
  "us-east-1a",
  "us-east-1b"
]
enable_third_az       = false
enable_nat_gateway_ha = false  # Single NAT to save costs

#---------------------------
# Domain
#---------------------------
domain_name         = "ryuzen.ai"
api_subdomain       = "api-staging"
workspace_subdomain = "app-staging"
route53_zone_id     = ""
create_dns_zone     = false

#---------------------------
# Compute (Lambda)
#---------------------------
lambda_runtime = "python3.11"

# TORON Lambda - Same config but no provisioned concurrency
lambda_memory_toron           = 1024
lambda_timeout_toron          = 30
provisioned_concurrency_toron = 0
reserved_concurrency_toron    = 50  # Lower limit in staging

# Workspace Lambda
lambda_memory_workspace           = 512
lambda_timeout_workspace          = 10
provisioned_concurrency_workspace = 0

enable_provisioned_concurrency = false  # Disabled in staging

#---------------------------
# Database
#---------------------------
# Aurora PostgreSQL Serverless v2
aurora_min_capacity     = 0.5
aurora_max_capacity     = 4     # Lower max in staging
aurora_instance_count   = 1     # Single instance (no Multi-AZ)
aurora_backup_retention = 7     # Shorter retention

# DynamoDB
dynamodb_billing_mode         = "PAY_PER_REQUEST"
enable_dynamodb_global_tables = false

# RDS Proxy
enable_rds_proxy = true

#---------------------------
# Storage
#---------------------------
telemetry_retention_days          = 30   # Shorter retention
backup_retention_days             = 30
enable_s3_cross_region_replication = false
s3_force_destroy                  = true  # Allow cleanup

#---------------------------
# Security
#---------------------------
enable_waf        = true
waf_rate_limit    = 1000  # Lower rate limit
waf_blocked_countries = []

enable_shield_advanced = false
enable_guardduty       = true
enable_security_hub    = false  # Disable to save costs

kms_key_deletion_window = 7  # Shorter window for staging

#---------------------------
# Monitoring
#---------------------------
alarm_email          = "staging-alerts@ryuzen.ai"
critical_alarm_phone = ""
pagerduty_endpoint   = ""
slack_webhook_url    = ""

log_retention_days  = 7
enable_xray_tracing = true
xray_sampling_rate  = 0.10  # Higher sampling for debugging

#---------------------------
# AI/ML (Bedrock)
#---------------------------
bedrock_models = [
  "anthropic.claude-3-haiku-20240307-v1:0",  # Cheaper model for testing
  "meta.llama3-1-8b-instruct-v1:0",
  "mistral.mistral-small-2402-v1:0"
]

external_api_providers = [
  "openai",
  "anthropic"
]

#---------------------------
# Compliance
#---------------------------
compliance_frameworks = ["SOC2"]
enable_hipaa          = false
enable_fedramp        = false

#---------------------------
# Disaster Recovery
#---------------------------
enable_dr    = false
dr_rpo_hours = 24
dr_rto_hours = 24

#---------------------------
# VPC Endpoints
#---------------------------
vpc_endpoint_services = [
  "secretsmanager",
  "bedrock-runtime"
]
enable_vpc_endpoint_cloudwatch = false

#---------------------------
# Cost Optimization
#---------------------------
enable_cost_alerts           = true
monthly_budget_usd           = 200
daily_cost_anomaly_threshold = 50

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
  deploy_cloudfront       = false
  deploy_monitoring       = true
}

#---------------------------
# Additional Tags
#---------------------------
additional_tags = {
  Purpose = "Staging"
}
