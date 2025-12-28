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

variable "dr_region" {
  description = "DR region"
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

variable "primary_vpc_id" {
  description = "Primary VPC ID"
  type        = string
}

variable "primary_s3_buckets" {
  description = "Primary S3 bucket ARNs"
  type        = list(string)
  default     = []
}

variable "primary_rds_cluster" {
  description = "Primary RDS cluster ARN"
  type        = string
  default     = ""
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
