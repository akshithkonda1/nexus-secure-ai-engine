#############################
# Backup Module
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

variable "kms_key_arn" {
  description = "KMS key ARN for backup encryption"
  type        = string
}

# Backup vault lock (WORM compliance)
variable "enable_backup_lock" {
  description = "Enable backup vault lock (WORM)"
  type        = bool
  default     = false
}

variable "min_retention_days" {
  description = "Minimum backup retention days (vault lock)"
  type        = number
  default     = 90
}

variable "max_retention_days" {
  description = "Maximum backup retention days (vault lock)"
  type        = number
  default     = 2555  # 7 years
}

# Cross-region backup
variable "enable_cross_region_backup" {
  description = "Enable cross-region backup for DR"
  type        = bool
  default     = false
}

variable "dr_region" {
  description = "DR region for cross-region backups"
  type        = string
  default     = "us-west-2"
}

variable "dr_kms_key_arn" {
  description = "KMS key ARN in DR region"
  type        = string
  default     = ""
}

# Resources to backup
variable "backup_resources" {
  description = "List of resource ARNs to backup"
  type        = list(string)
  default     = []
}

variable "dynamodb_table_arns" {
  description = "List of DynamoDB table ARNs"
  type        = list(string)
  default     = []
}

variable "rds_cluster_arns" {
  description = "List of RDS cluster ARNs"
  type        = list(string)
  default     = []
}

variable "s3_bucket_arns" {
  description = "List of S3 bucket ARNs to backup"
  type        = list(string)
  default     = []
}

# Reporting
variable "backup_reports_bucket_name" {
  description = "S3 bucket name for backup reports"
  type        = string
}

# Alarms
variable "critical_alarm_sns_topic_arn" {
  description = "SNS topic ARN for critical alarms"
  type        = string
}

variable "alarm_sns_topic_arn" {
  description = "SNS topic ARN for standard alarms"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
