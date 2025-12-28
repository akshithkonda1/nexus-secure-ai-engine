#############################
# Storage Module
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

variable "telemetry_retention_days" {
  description = "Days to retain telemetry data"
  type        = number
  default     = 90
}

variable "backup_retention_days" {
  description = "Days to retain backups"
  type        = number
  default     = 2555
}

variable "enable_cross_region_replication" {
  description = "Enable cross-region replication"
  type        = bool
  default     = false
}

variable "dr_region" {
  description = "Disaster recovery region"
  type        = string
  default     = "us-west-2"
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
}

variable "force_destroy" {
  description = "Allow bucket deletion with objects"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
