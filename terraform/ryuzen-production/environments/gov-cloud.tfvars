#############################
# Ryuzen GovCloud Environment
# Configuration Variables
#############################
#
# Deploy with: terraform apply -var-file=environments/gov-cloud.tfvars
#
# GovCloud environment for government contracts with:
# - FedRAMP compliance
# - HIPAA compliance
# - Enhanced security controls
# - Extended retention periods
# - Full HA configuration
#
# IMPORTANT: This configuration is for AWS GovCloud regions
# which require a separate AWS account and approval.
#
#############################

#---------------------------
# Environment
#---------------------------
environment    = "gov-cloud"
name_prefix    = "ryuzen"
aws_region     = "us-gov-west-1"  # GovCloud region
dr_region      = "us-gov-east-1"
aws_account_id = "" # Set via environment variable or CLI

#---------------------------
# Networking
#---------------------------
vpc_cidr = "10.3.0.0/16"
availability_zones = [
  "us-gov-west-1a",
  "us-gov-west-1b",
  "us-gov-west-1c"
]
enable_third_az       = true   # Full HA for government
enable_nat_gateway_ha = true

#---------------------------
# Domain
#---------------------------
domain_name         = "ryuzen.gov"  # .gov domain
api_subdomain       = "api"
workspace_subdomain = "app"
route53_zone_id     = ""
create_dns_zone     = false

#---------------------------
# Compute (Lambda)
#---------------------------
lambda_runtime = "python3.11"

# TORON Lambda
lambda_memory_toron           = 2048  # Higher for government workloads
lambda_timeout_toron          = 30
provisioned_concurrency_toron = 10
reserved_concurrency_toron    = 200

# Workspace Lambda
lambda_memory_workspace           = 1024
lambda_timeout_workspace          = 10
provisioned_concurrency_workspace = 5

enable_provisioned_concurrency = true

#---------------------------
# Database
#---------------------------
# Aurora PostgreSQL Serverless v2
aurora_min_capacity     = 2     # Higher minimum for government SLAs
aurora_max_capacity     = 32
aurora_instance_count   = 3     # Three instances for full HA
aurora_backup_retention = 365   # 1 year retention

# DynamoDB
dynamodb_billing_mode         = "PAY_PER_REQUEST"
enable_dynamodb_global_tables = true  # Multi-region for DR

# RDS Proxy
enable_rds_proxy = true

#---------------------------
# Storage
#---------------------------
telemetry_retention_days          = 365   # 1 year for compliance
backup_retention_days             = 2555  # 7 years
enable_s3_cross_region_replication = true
s3_force_destroy                  = false

#---------------------------
# Security
#---------------------------
enable_waf        = true
waf_rate_limit    = 5000
waf_blocked_countries = []  # Configure based on requirements

enable_shield_advanced = true  # Enterprise DDoS for government
enable_guardduty       = true
enable_security_hub    = true

kms_key_deletion_window = 30

#---------------------------
# Monitoring
#---------------------------
alarm_email          = "govcloud-alerts@ryuzen.gov"
critical_alarm_phone = ""  # Configure with government contact
pagerduty_endpoint   = ""
slack_webhook_url    = ""

log_retention_days  = 365  # 1 year retention
enable_xray_tracing = true
xray_sampling_rate  = 0.10

#---------------------------
# AI/ML (Bedrock)
#---------------------------
# Note: Bedrock availability may differ in GovCloud
bedrock_models = [
  "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "anthropic.claude-3-haiku-20240307-v1:0",
  "amazon.titan-text-express-v1"
]

external_api_providers = []  # No external APIs for government

#---------------------------
# Compliance
#---------------------------
compliance_frameworks = ["SOC2", "GDPR", "HIPAA", "FedRAMP"]
enable_hipaa          = true
enable_fedramp        = true

#---------------------------
# Disaster Recovery
#---------------------------
enable_dr    = true
dr_rpo_hours = 0.5   # 30 minutes max data loss
dr_rto_hours = 1     # 1 hour recovery

#---------------------------
# VPC Endpoints
#---------------------------
vpc_endpoint_services = [
  "secretsmanager",
  "bedrock-runtime",
  "kms",
  "sts"
]
enable_vpc_endpoint_cloudwatch = true

#---------------------------
# Cost Optimization
#---------------------------
enable_cost_alerts           = true
monthly_budget_usd           = 5000
daily_cost_anomaly_threshold = 500

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
  deploy_cloudfront       = true  # CDN enabled
  deploy_monitoring       = true
}

#---------------------------
# Additional Tags
#---------------------------
additional_tags = {
  Classification = "CUI"  # Controlled Unclassified Information
  Contract       = ""     # Government contract number
}
