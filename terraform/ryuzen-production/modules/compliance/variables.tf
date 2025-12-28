#############################
# Compliance Module
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

variable "region" {
  description = "AWS region"
  type        = string
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
}

# Compliance frameworks
variable "enable_soc2" {
  description = "Enable SOC2 compliance controls"
  type        = bool
  default     = true
}

variable "enable_gdpr" {
  description = "Enable GDPR compliance controls"
  type        = bool
  default     = true
}

variable "enable_hipaa" {
  description = "Enable HIPAA compliance controls"
  type        = bool
  default     = false
}

variable "enable_fedramp" {
  description = "Enable FedRAMP compliance controls"
  type        = bool
  default     = false
}

# GDPR configuration
variable "telemetry_bucket_name" {
  description = "S3 bucket name for telemetry data (subject to GDPR)"
  type        = string
  default     = ""
}

variable "telemetry_retention_days" {
  description = "Data retention period for telemetry (GDPR)"
  type        = number
  default     = 90
}

variable "dynamodb_table_names" {
  description = "List of DynamoDB table names"
  type        = list(string)
  default     = []
}

variable "dynamodb_table_arns" {
  description = "List of DynamoDB table ARNs"
  type        = list(string)
  default     = []
}

variable "rds_cluster_arn" {
  description = "RDS cluster ARN"
  type        = string
  default     = ""
}

variable "s3_bucket_names" {
  description = "List of S3 bucket names"
  type        = list(string)
  default     = []
}

variable "s3_bucket_arns" {
  description = "List of S3 bucket ARNs"
  type        = list(string)
  default     = []
}

variable "audit_log_table_name" {
  description = "DynamoDB table name for audit logs"
  type        = string
  default     = ""
}

# HIPAA configuration
variable "medical_data_bucket_name" {
  description = "S3 bucket name for medical data (PHI)"
  type        = string
  default     = ""
}

variable "medical_data_bucket_arn" {
  description = "S3 bucket ARN for medical data"
  type        = string
  default     = ""
}

variable "cloudtrail_bucket_name" {
  description = "S3 bucket name for CloudTrail logs"
  type        = string
}

variable "cloudtrail_bucket_arn" {
  description = "S3 bucket ARN for CloudTrail logs"
  type        = string
  default     = ""
}

# Reporting
variable "compliance_report_sns_topic_arn" {
  description = "SNS topic ARN for compliance reports"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
