#############################
# Networking Module
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

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

variable "enable_nat_gateway_ha" {
  description = "Enable NAT gateway high availability"
  type        = bool
  default     = true
}

variable "vpc_endpoint_services" {
  description = "List of VPC endpoint services to create"
  type        = list(string)
  default     = []
}

variable "enable_vpc_endpoint_cloudwatch" {
  description = "Enable CloudWatch Logs VPC endpoint"
  type        = bool
  default     = false
}

variable "enable_waf" {
  description = "Enable AWS WAF"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "WAF rate limit per 5 minutes"
  type        = number
  default     = 2000
}

variable "waf_blocked_countries" {
  description = "List of country codes to block"
  type        = list(string)
  default     = []
}

variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "api_subdomain" {
  description = "API subdomain"
  type        = string
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
