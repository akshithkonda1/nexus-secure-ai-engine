#############################
# Database Module
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

#---------------------------
# VPC Configuration
#---------------------------
variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "database_subnet_ids" {
  description = "Database subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "db_subnet_group_name" {
  description = "Database subnet group name"
  type        = string
  default     = ""
}

variable "lambda_security_group_id" {
  description = "Lambda security group ID"
  type        = string
}

#---------------------------
# DynamoDB Configuration
#---------------------------
variable "deploy_dynamodb" {
  description = "Deploy DynamoDB tables"
  type        = bool
  default     = true
}

variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "enable_dynamodb_global_tables" {
  description = "Enable DynamoDB global tables"
  type        = bool
  default     = false
}

variable "dr_region" {
  description = "Disaster recovery region"
  type        = string
  default     = "us-west-2"
}

#---------------------------
# Aurora Configuration
#---------------------------
variable "deploy_aurora" {
  description = "Deploy Aurora PostgreSQL"
  type        = bool
  default     = true
}

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
  description = "Number of Aurora instances"
  type        = number
  default     = 2
}

variable "aurora_backup_retention" {
  description = "Aurora backup retention days"
  type        = number
  default     = 30
}

variable "enable_rds_proxy" {
  description = "Enable RDS Proxy"
  type        = bool
  default     = true
}

variable "db_credentials_secret_arn" {
  description = "ARN of Secrets Manager secret for DB credentials"
  type        = string
}

#---------------------------
# Encryption
#---------------------------
variable "kms_key_arn" {
  description = "KMS key ARN for encryption"
  type        = string
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
