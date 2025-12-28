#############################
# Ryuzen Production Infrastructure
# Global Variables
#############################

#---------------------------
# Environment Configuration
#---------------------------

variable "environment" {
  description = "Environment name (production, staging, dev)"
  type        = string
  validation {
    condition     = contains(["production", "staging", "dev", "gov-cloud"], var.environment)
    error_message = "Environment must be one of: production, staging, dev, gov-cloud."
  }
}

variable "name_prefix" {
  description = "Prefix for all resource names"
  type        = string
  default     = "ryuzen"
}

variable "aws_region" {
  description = "Primary AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "dr_region" {
  description = "Disaster recovery region"
  type        = string
  default     = "us-west-2"
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

#---------------------------
# Networking Configuration
#---------------------------

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "enable_third_az" {
  description = "Enable third availability zone for enhanced HA"
  type        = bool
  default     = false
}

variable "enable_nat_gateway_ha" {
  description = "Deploy NAT gateways in all AZs (true) or single NAT (false)"
  type        = bool
  default     = true
}

#---------------------------
# Domain Configuration
#---------------------------

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "ryuzen.ai"
}

variable "api_subdomain" {
  description = "API subdomain prefix"
  type        = string
  default     = "api"
}

variable "workspace_subdomain" {
  description = "Workspace subdomain prefix"
  type        = string
  default     = "app"
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID (leave empty to skip DNS)"
  type        = string
  default     = ""
}

variable "create_dns_zone" {
  description = "Create Route 53 hosted zone if it doesn't exist"
  type        = bool
  default     = false
}

#---------------------------
# Compute Configuration
#---------------------------

variable "lambda_runtime" {
  description = "Lambda runtime version"
  type        = string
  default     = "python3.11"
}

variable "lambda_memory_toron" {
  description = "Memory allocation for TORON Lambda (MB)"
  type        = number
  default     = 1024
  validation {
    condition     = var.lambda_memory_toron >= 128 && var.lambda_memory_toron <= 10240
    error_message = "Lambda memory must be between 128 and 10240 MB."
  }
}

variable "lambda_memory_workspace" {
  description = "Memory allocation for Workspace API Lambda (MB)"
  type        = number
  default     = 512
}

variable "lambda_timeout_toron" {
  description = "Timeout for TORON Lambda (seconds)"
  type        = number
  default     = 30
}

variable "lambda_timeout_workspace" {
  description = "Timeout for Workspace API Lambda (seconds)"
  type        = number
  default     = 10
}

variable "provisioned_concurrency_toron" {
  description = "Provisioned concurrency for TORON Lambda"
  type        = number
  default     = 5
}

variable "provisioned_concurrency_workspace" {
  description = "Provisioned concurrency for Workspace API Lambda"
  type        = number
  default     = 2
}

variable "reserved_concurrency_toron" {
  description = "Reserved concurrency limit for TORON Lambda (prevents runaway costs)"
  type        = number
  default     = 100
}

variable "enable_provisioned_concurrency" {
  description = "Enable provisioned concurrency for production (false for staging/dev)"
  type        = bool
  default     = true
}

#---------------------------
# Database Configuration
#---------------------------

variable "aurora_min_capacity" {
  description = "Minimum ACU for Aurora Serverless v2"
  type        = number
  default     = 0.5
}

variable "aurora_max_capacity" {
  description = "Maximum ACU for Aurora Serverless v2"
  type        = number
  default     = 16
}

variable "aurora_instance_count" {
  description = "Number of Aurora instances (min 2 for Multi-AZ)"
  type        = number
  default     = 2
}

variable "aurora_backup_retention" {
  description = "Aurora backup retention period (days)"
  type        = number
  default     = 30
}

variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode (PAY_PER_REQUEST or PROVISIONED)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "enable_dynamodb_global_tables" {
  description = "Enable DynamoDB global tables for multi-region"
  type        = bool
  default     = false
}

variable "enable_rds_proxy" {
  description = "Enable RDS Proxy for connection pooling"
  type        = bool
  default     = true
}

#---------------------------
# Storage Configuration
#---------------------------

variable "telemetry_retention_days" {
  description = "Days to retain telemetry data (GDPR compliance)"
  type        = number
  default     = 90
}

variable "backup_retention_days" {
  description = "Days to retain backups"
  type        = number
  default     = 2555 # 7 years for compliance
}

variable "enable_s3_cross_region_replication" {
  description = "Enable S3 cross-region replication for DR"
  type        = bool
  default     = false
}

variable "s3_force_destroy" {
  description = "Allow bucket deletion with objects (dev/staging only)"
  type        = bool
  default     = false
}

#---------------------------
# Security Configuration
#---------------------------

variable "enable_waf" {
  description = "Enable AWS WAF on ALB"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "WAF rate limit per 5-minute period per IP"
  type        = number
  default     = 2000
}

variable "waf_blocked_countries" {
  description = "List of country codes to block (ISO 3166-1 alpha-2)"
  type        = list(string)
  default     = []
}

variable "enable_shield_advanced" {
  description = "Enable AWS Shield Advanced (enterprise DDoS protection)"
  type        = bool
  default     = false
}

variable "enable_guardduty" {
  description = "Enable GuardDuty threat detection"
  type        = bool
  default     = true
}

variable "enable_security_hub" {
  description = "Enable Security Hub for centralized findings"
  type        = bool
  default     = true
}

variable "kms_key_deletion_window" {
  description = "KMS key deletion window (days)"
  type        = number
  default     = 30
}

#---------------------------
# Monitoring Configuration
#---------------------------

variable "alarm_email" {
  description = "Email address for CloudWatch alarms"
  type        = string
}

variable "critical_alarm_phone" {
  description = "Phone number for critical SMS alerts"
  type        = string
  default     = ""
}

variable "pagerduty_endpoint" {
  description = "PagerDuty HTTPS endpoint for critical alerts"
  type        = string
  default     = ""
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  default     = ""
  sensitive   = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention period (days)"
  type        = number
  default     = 30
}

variable "enable_xray_tracing" {
  description = "Enable X-Ray distributed tracing"
  type        = bool
  default     = true
}

variable "xray_sampling_rate" {
  description = "X-Ray sampling rate (0.0 to 1.0)"
  type        = number
  default     = 0.05
}

#---------------------------
# AI/ML Configuration
#---------------------------

variable "bedrock_models" {
  description = "List of Bedrock models to enable access for"
  type        = list(string)
  default = [
    "anthropic.claude-3-5-sonnet-20241022-v2:0",
    "anthropic.claude-3-haiku-20240307-v1:0",
    "meta.llama3-1-70b-instruct-v1:0",
    "meta.llama3-1-8b-instruct-v1:0",
    "mistral.mistral-large-2407-v1:0",
    "mistral.mistral-small-2402-v1:0",
    "amazon.titan-text-express-v1",
    "cohere.command-r-plus-v1:0"
  ]
}

variable "external_api_providers" {
  description = "External AI API providers to configure secrets for"
  type        = list(string)
  default = [
    "openai",
    "anthropic",
    "google",
    "xai",
    "perplexity"
  ]
}

#---------------------------
# Compliance Configuration
#---------------------------

variable "compliance_frameworks" {
  description = "Compliance frameworks to enable"
  type        = list(string)
  default     = ["SOC2", "GDPR"]
  validation {
    condition     = alltrue([for f in var.compliance_frameworks : contains(["SOC2", "GDPR", "HIPAA", "FedRAMP", "PCI-DSS"], f)])
    error_message = "Invalid compliance framework. Allowed: SOC2, GDPR, HIPAA, FedRAMP, PCI-DSS."
  }
}

variable "enable_hipaa" {
  description = "Enable HIPAA-compliant configurations"
  type        = bool
  default     = false
}

variable "enable_fedramp" {
  description = "Enable FedRAMP configurations (requires GovCloud)"
  type        = bool
  default     = false
}

#---------------------------
# Disaster Recovery Configuration
#---------------------------

variable "enable_dr" {
  description = "Enable disaster recovery configurations"
  type        = bool
  default     = false
}

variable "dr_rpo_hours" {
  description = "Recovery Point Objective (hours of data loss acceptable)"
  type        = number
  default     = 1
}

variable "dr_rto_hours" {
  description = "Recovery Time Objective (hours to restore service)"
  type        = number
  default     = 4
}

#---------------------------
# VPC Endpoints Configuration
#---------------------------

variable "vpc_endpoint_services" {
  description = "List of VPC endpoint services to create"
  type        = list(string)
  default = [
    "secretsmanager",
    "bedrock-runtime"
  ]
}

variable "enable_vpc_endpoint_cloudwatch" {
  description = "Enable CloudWatch Logs VPC endpoint (saves NAT costs)"
  type        = bool
  default     = false
}

#---------------------------
# Cost Optimization
#---------------------------

variable "enable_cost_alerts" {
  description = "Enable AWS Cost Explorer alerts"
  type        = bool
  default     = true
}

variable "monthly_budget_usd" {
  description = "Monthly budget threshold for cost alerts"
  type        = number
  default     = 500
}

variable "daily_cost_anomaly_threshold" {
  description = "Daily cost anomaly detection threshold (USD)"
  type        = number
  default     = 100
}

#---------------------------
# Tags
#---------------------------

variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

#---------------------------
# Feature Flags
#---------------------------

variable "features" {
  description = "Feature flags for enabling/disabling components"
  type = object({
    deploy_toron_lambda       = bool
    deploy_workspace_lambda   = bool
    deploy_oauth_lambda       = bool
    deploy_telemetry_lambda   = bool
    deploy_aurora             = bool
    deploy_dynamodb           = bool
    deploy_cloudfront         = bool
    deploy_monitoring         = bool
  })
  default = {
    deploy_toron_lambda       = true
    deploy_workspace_lambda   = true
    deploy_oauth_lambda       = true
    deploy_telemetry_lambda   = true
    deploy_aurora             = true
    deploy_dynamodb           = true
    deploy_cloudfront         = false
    deploy_monitoring         = true
  }
}
