variable "region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "replica_count" {
  description = "Number of desired tasks"
  type        = number
  default     = 2
}

variable "image_tag" {
  description = "Image tag pushed to ECR"
  type        = string
  default     = "latest"
}

variable "container_port" {
  description = "Container port exposed by Toron"
  type        = number
  default     = 8080
}

variable "vpc_cidr" {
  description = "CIDR block for the Toron VPC"
  type        = string
  default     = "10.10.0.0/16"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "ryuzen.ai"
}

variable "api_subdomain" {
  description = "API subdomain"
  type        = string
  default     = "api"
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for ryuzen.ai"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for *.ryuzen.ai"
  type        = string
  default     = ""
}
