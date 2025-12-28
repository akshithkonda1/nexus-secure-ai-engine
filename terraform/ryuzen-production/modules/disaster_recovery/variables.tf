#############################
# Disaster Recovery Module
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

variable "primary_region" {
  description = "Primary AWS region"
  type        = string
}

variable "dr_region" {
  description = "DR AWS region"
  type        = string
}

variable "dr_rpo_hours" {
  description = "Recovery Point Objective (hours)"
  type        = number
  default     = 1
}

variable "dr_rto_hours" {
  description = "Recovery Time Objective (hours)"
  type        = number
  default     = 4
}

variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
}

# Route 53 configuration
variable "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
  default     = ""
}

variable "primary_alb_dns_name" {
  description = "Primary ALB DNS name"
  type        = string
  default     = ""
}

variable "dr_alb_dns_name" {
  description = "DR ALB DNS name"
  type        = string
  default     = ""
}

# S3 replication
variable "enable_s3_replication" {
  description = "Enable S3 cross-region replication"
  type        = bool
  default     = false
}

variable "source_bucket_arns" {
  description = "Source S3 bucket ARNs for replication"
  type        = list(string)
  default     = []
}

variable "destination_bucket_arns" {
  description = "Destination S3 bucket ARNs for replication"
  type        = list(string)
  default     = []
}

variable "source_bucket_name" {
  description = "Primary source bucket name for metrics"
  type        = string
  default     = ""
}

variable "destination_bucket_name" {
  description = "Destination bucket name for metrics"
  type        = string
  default     = ""
}

# DynamoDB Global Tables
variable "enable_dynamodb_global_tables" {
  description = "Enable DynamoDB Global Tables monitoring"
  type        = bool
  default     = false
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name for monitoring"
  type        = string
  default     = ""
}

# RDS cross-region replica
variable "enable_rds_cross_region_replica" {
  description = "Enable RDS cross-region replica monitoring"
  type        = bool
  default     = false
}

variable "dr_rds_cluster_identifier" {
  description = "DR RDS cluster identifier"
  type        = string
  default     = ""
}

# Failover configuration
variable "enable_automated_failover" {
  description = "Enable automated failover on AWS Health events"
  type        = bool
  default     = false
}

variable "enable_dr_testing" {
  description = "Enable quarterly DR testing"
  type        = bool
  default     = true
}

# SNS topics
variable "critical_alarm_sns_topic_arn" {
  description = "SNS topic ARN for critical alarms"
  type        = string
}

variable "alarm_sns_topic_arn" {
  description = "SNS topic ARN for standard alarms"
  type        = string
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
