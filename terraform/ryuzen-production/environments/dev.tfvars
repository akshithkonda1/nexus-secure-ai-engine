#############################
# Ryuzen Development Environment
# Configuration Variables
#############################
#
# Deploy with: terraform apply -var-file=environments/dev.tfvars
#
# Development environment with:
# - Minimal resources
# - No HA (single AZ where possible)
# - Short retention periods
# - Force destroy enabled
# - Minimal security features
#
#############################

#---------------------------
# Environment
#---------------------------
environment    = "dev"
name_prefix    = "ryuzen"
aws_region     = "us-east-1"
dr_region      = "us-west-2"
aws_account_id = "" # Set via environment variable or CLI

#---------------------------
# Networking
#---------------------------
vpc_cidr = "10.2.0.0/16"  # Different CIDR from other envs
availability_zones = [
  "us-east-1a",
  "us-east-1b"
]
enable_third_az       = false
enable_nat_gateway_ha = false  # Single NAT

#---------------------------
# Domain
#---------------------------
domain_name         = "ryuzen.ai"
api_subdomain       = "api-dev"
workspace_subdomain = "app-dev"
route53_zone_id     = ""
create_dns_zone     = false

#---------------------------
# Compute (Lambda)
#---------------------------
lambda_runtime = "python3.11"

# TORON Lambda - Lower resources for dev
lambda_memory_toron           = 512
lambda_timeout_toron          = 30
provisioned_concurrency_toron = 0
reserved_concurrency_toron    = 20

# Workspace Lambda
lambda_memory_workspace           = 256
lambda_timeout_workspace          = 10
provisioned_concurrency_workspace = 0

enable_provisioned_concurrency = false

#---------------------------
# Database
#---------------------------
# Aurora PostgreSQL Serverless v2
aurora_min_capacity     = 0.5
aurora_max_capacity     = 2
aurora_instance_count   = 1
aurora_backup_retention = 1

# DynamoDB
dynamodb_billing_mode         = "PAY_PER_REQUEST"
enable_dynamodb_global_tables = false

# RDS Proxy
enable_rds_proxy = false  # Skip in dev

#---------------------------
# Storage
#---------------------------
telemetry_retention_days          = 7
backup_retention_days             = 7
enable_s3_cross_region_replication = false
s3_force_destroy                  = true

#---------------------------
# Security
#---------------------------
enable_waf        = false  # Skip in dev
waf_rate_limit    = 1000
waf_blocked_countries = []

enable_shield_advanced = false
enable_guardduty       = false
enable_security_hub    = false

kms_key_deletion_window = 7

#---------------------------
# Monitoring
#---------------------------
alarm_email          = "dev-alerts@ryuzen.ai"
critical_alarm_phone = ""
pagerduty_endpoint   = ""
slack_webhook_url    = ""

log_retention_days  = 3
enable_xray_tracing = true
xray_sampling_rate  = 0.50  # High sampling for debugging

#---------------------------
# AI/ML (Bedrock)
#---------------------------
bedrock_models = [
  "anthropic.claude-3-haiku-20240307-v1:0"
]

external_api_providers = [
  "openai"
]

#---------------------------
# Compliance
#---------------------------
compliance_frameworks = []
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
  "secretsmanager"
]
enable_vpc_endpoint_cloudwatch = false

#---------------------------
# Cost Optimization
#---------------------------
enable_cost_alerts           = true
monthly_budget_usd           = 100
daily_cost_anomaly_threshold = 25

#---------------------------
# Feature Flags
#---------------------------
features = {
  deploy_toron_lambda     = true
  deploy_workspace_lambda = true
  deploy_oauth_lambda     = false  # Skip OAuth in dev
  deploy_telemetry_lambda = false  # Skip telemetry in dev
  deploy_aurora           = true
  deploy_dynamodb         = true
  deploy_cloudfront       = false
  deploy_monitoring       = true
}

#---------------------------
# Additional Tags
#---------------------------
additional_tags = {
  Purpose = "Development"
}
