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

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "enable_waf" {
  description = "Enable WAF"
  type        = bool
  default     = true
}

variable "alb_arn" {
  description = "ALB ARN for Shield protection"
  type        = string
  default     = ""
}

variable "enable_shield_advanced" {
  description = "Enable Shield Advanced"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
