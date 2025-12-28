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

variable "backup_retention_days" {
  description = "Backup retention in days"
  type        = number
  default     = 2555
}

variable "rds_cluster_arn" {
  description = "RDS cluster ARN"
  type        = string
  default     = ""
}

variable "dynamodb_table_arns" {
  description = "DynamoDB table ARNs"
  type        = list(string)
  default     = []
}

variable "s3_bucket_arns" {
  description = "S3 bucket ARNs"
  type        = list(string)
  default     = []
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
