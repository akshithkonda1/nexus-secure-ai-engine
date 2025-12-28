#############################
# Compute Module
# Variables
#############################

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "lambda_security_group_id" {
  description = "Lambda security group ID"
  type        = string
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "python3.11"
}

#---------------------------
# TORON Lambda Configuration
#---------------------------
variable "deploy_toron_lambda" {
  description = "Deploy TORON Lambda"
  type        = bool
  default     = true
}

variable "lambda_memory_toron" {
  description = "Memory for TORON Lambda"
  type        = number
  default     = 1024
}

variable "lambda_timeout_toron" {
  description = "Timeout for TORON Lambda"
  type        = number
  default     = 30
}

variable "provisioned_concurrency_toron" {
  description = "Provisioned concurrency for TORON Lambda"
  type        = number
  default     = 0
}

variable "reserved_concurrency_toron" {
  description = "Reserved concurrency for TORON Lambda"
  type        = number
  default     = 100
}

#---------------------------
# Workspace Lambda Configuration
#---------------------------
variable "deploy_workspace_lambda" {
  description = "Deploy Workspace Lambda"
  type        = bool
  default     = true
}

variable "lambda_memory_workspace" {
  description = "Memory for Workspace Lambda"
  type        = number
  default     = 512
}

variable "lambda_timeout_workspace" {
  description = "Timeout for Workspace Lambda"
  type        = number
  default     = 10
}

variable "provisioned_concurrency_workspace" {
  description = "Provisioned concurrency for Workspace Lambda"
  type        = number
  default     = 0
}

#---------------------------
# OAuth Lambda Configuration
#---------------------------
variable "deploy_oauth_lambda" {
  description = "Deploy OAuth Lambda"
  type        = bool
  default     = true
}

#---------------------------
# Telemetry Lambda Configuration
#---------------------------
variable "deploy_telemetry_lambda" {
  description = "Deploy Telemetry Lambda"
  type        = bool
  default     = true
}

#---------------------------
# Tracing Configuration
#---------------------------
variable "enable_xray_tracing" {
  description = "Enable X-Ray tracing"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention days"
  type        = number
  default     = 30
}

#---------------------------
# Secrets Configuration
#---------------------------
variable "secrets_kms_key_arn" {
  description = "KMS key ARN for secrets"
  type        = string
}

variable "api_secrets_arns" {
  description = "List of API secret ARNs"
  type        = list(string)
  default     = []
}

variable "db_credentials_secret_arn" {
  description = "Database credentials secret ARN"
  type        = string
  default     = ""
}

#---------------------------
# Database Configuration
#---------------------------
variable "dynamodb_table_arns" {
  description = "DynamoDB table ARNs"
  type        = list(string)
  default     = []
}

variable "dynamodb_tier1_table_name" {
  description = "DynamoDB Tier 1 cache table name"
  type        = string
  default     = ""
}

variable "dynamodb_tier3_table_name" {
  description = "DynamoDB Tier 3 cache table name"
  type        = string
  default     = ""
}

variable "rds_cluster_arn" {
  description = "RDS cluster ARN"
  type        = string
  default     = ""
}

variable "rds_proxy_endpoint" {
  description = "RDS Proxy endpoint"
  type        = string
  default     = ""
}

#---------------------------
# S3 Configuration
#---------------------------
variable "telemetry_bucket_arn" {
  description = "Telemetry S3 bucket ARN"
  type        = string
}

variable "telemetry_bucket_name" {
  description = "Telemetry S3 bucket name"
  type        = string
  default     = ""
}

variable "artifacts_bucket_arn" {
  description = "Artifacts S3 bucket ARN"
  type        = string
}

variable "artifacts_bucket_name" {
  description = "Artifacts S3 bucket name"
  type        = string
  default     = ""
}

#---------------------------
# Bedrock Configuration
#---------------------------
variable "bedrock_models" {
  description = "List of Bedrock models"
  type        = list(string)
  default     = []
}

#---------------------------
# ALB Configuration
#---------------------------
variable "alb_target_group_arn" {
  description = "ALB target group ARN"
  type        = string
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
