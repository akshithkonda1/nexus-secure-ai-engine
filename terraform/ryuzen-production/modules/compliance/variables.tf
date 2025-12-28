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

variable "compliance_frameworks" {
  description = "List of compliance frameworks"
  type        = list(string)
  default     = []
}

variable "enable_hipaa" {
  description = "Enable HIPAA compliance"
  type        = bool
  default     = false
}

variable "enable_fedramp" {
  description = "Enable FedRAMP compliance"
  type        = bool
  default     = false
}

variable "enable_soc2" {
  description = "Enable SOC2 compliance"
  type        = bool
  default     = true
}

variable "enable_gdpr" {
  description = "Enable GDPR compliance"
  type        = bool
  default     = true
}

variable "telemetry_retention_days" {
  description = "Data retention period for telemetry"
  type        = number
  default     = 90
}

variable "kms_key_arn" {
  description = "KMS key ARN"
  type        = string
}

variable "cloudtrail_bucket_arn" {
  description = "CloudTrail bucket ARN"
  type        = string
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
