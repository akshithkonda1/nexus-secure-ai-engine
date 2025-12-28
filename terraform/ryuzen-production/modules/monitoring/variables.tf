#############################
# Monitoring Module
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

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "alarm_email" {
  description = "Email for alarms"
  type        = string
}

variable "critical_alarm_phone" {
  description = "Phone for critical alerts"
  type        = string
  default     = ""
}

variable "pagerduty_endpoint" {
  description = "PagerDuty endpoint"
  type        = string
  default     = ""
}

variable "slack_webhook_url" {
  description = "Slack webhook URL"
  type        = string
  default     = ""
  sensitive   = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention"
  type        = number
  default     = 30
}

variable "enable_xray_tracing" {
  description = "Enable X-Ray tracing"
  type        = bool
  default     = true
}

variable "xray_sampling_rate" {
  description = "X-Ray sampling rate"
  type        = number
  default     = 0.05
}

variable "lambda_function_names" {
  description = "Lambda function names"
  type        = map(string)
  default     = {}
}

variable "lambda_function_arns" {
  description = "Lambda function ARNs"
  type        = map(string)
  default     = {}
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix"
  type        = string
  default     = ""
}

variable "target_group_arn_suffix" {
  description = "Target group ARN suffix"
  type        = string
  default     = ""
}

variable "rds_cluster_identifier" {
  description = "RDS cluster identifier"
  type        = string
  default     = ""
}

variable "dynamodb_table_names" {
  description = "DynamoDB table names"
  type        = list(string)
  default     = []
}

variable "enable_guardduty" {
  description = "Enable GuardDuty"
  type        = bool
  default     = true
}

variable "enable_security_hub" {
  description = "Enable Security Hub"
  type        = bool
  default     = true
}

variable "cloudtrail_bucket_arn" {
  description = "CloudTrail bucket ARN"
  type        = string
}

variable "cloudtrail_bucket_name" {
  description = "CloudTrail bucket name"
  type        = string
  default     = ""
}

variable "config_bucket_arn" {
  description = "Config bucket ARN"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN"
  type        = string
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
