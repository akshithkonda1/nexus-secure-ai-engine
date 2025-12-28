#############################
# Security Module
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

variable "region" {
  description = "AWS region"
  type        = string
}

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
}

# WAF configuration
variable "alb_arn" {
  description = "ALB ARN to associate with WAF"
  type        = string
}

variable "blocked_countries" {
  description = "Countries to block in WAF (ISO 3166 codes)"
  type        = list(string)
  default     = ["CU", "IR", "KP", "SY", "RU"]
}

variable "blocked_ips" {
  description = "IP addresses to block in WAF"
  type        = list(string)
  default     = []
}

variable "waf_logs_bucket_arn" {
  description = "S3 bucket ARN for WAF logs"
  type        = string
}

# Config configuration
variable "config_bucket_name" {
  description = "S3 bucket name for AWS Config"
  type        = string
}

variable "config_bucket_arn" {
  description = "S3 bucket ARN for AWS Config"
  type        = string
}

# Macie configuration
variable "enable_macie" {
  description = "Enable AWS Macie for PII detection"
  type        = bool
  default     = false
}

variable "telemetry_bucket_name" {
  description = "S3 bucket name for telemetry (Macie will scan)"
  type        = string
  default     = ""
}

# Shield Advanced
variable "enable_shield_advanced" {
  description = "Enable AWS Shield Advanced"
  type        = bool
  default     = false
}

# VPC Flow Logs
variable "vpc_flow_log_group_name" {
  description = "VPC Flow Logs CloudWatch log group name"
  type        = string
}

# SNS topics
variable "security_alarm_sns_topic_arn" {
  description = "SNS topic ARN for security alarms"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
