#############################
# Bedrock Module
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

variable "bedrock_models" {
  description = "List of Bedrock model IDs to enable"
  type        = list(string)
  default     = []
}

variable "lambda_role_arn" {
  description = "Lambda execution role ARN"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
