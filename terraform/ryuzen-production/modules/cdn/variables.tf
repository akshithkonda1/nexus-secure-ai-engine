#############################
# CDN Module
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

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "workspace_subdomain" {
  description = "Workspace subdomain"
  type        = string
  default     = "app"
}

variable "static_assets_bucket_arn" {
  description = "Static assets S3 bucket ARN"
  type        = string
}

variable "static_assets_bucket_domain_name" {
  description = "Static assets S3 bucket domain name"
  type        = string
}

variable "static_assets_bucket_id" {
  description = "Static assets S3 bucket ID"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
  default     = ""
}

variable "web_acl_arn" {
  description = "WAF Web ACL ARN"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
