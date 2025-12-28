#############################
# DNS Module
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

variable "api_subdomain" {
  description = "API subdomain"
  type        = string
  default     = "api"
}

variable "workspace_subdomain" {
  description = "Workspace subdomain"
  type        = string
  default     = "app"
}

variable "route53_zone_id" {
  description = "Existing Route 53 zone ID"
  type        = string
  default     = ""
}

variable "create_dns_zone" {
  description = "Create new Route 53 zone"
  type        = bool
  default     = false
}

variable "alb_dns_name" {
  description = "ALB DNS name"
  type        = string
  default     = ""
}

variable "alb_zone_id" {
  description = "ALB zone ID"
  type        = string
  default     = ""
}

variable "cloudfront_domain_name" {
  description = "CloudFront domain name"
  type        = string
  default     = ""
}

variable "cloudfront_zone_id" {
  description = "CloudFront zone ID"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
