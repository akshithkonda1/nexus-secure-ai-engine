variable "region" {
  description = "Azure region for AKS and ACR"
  type        = string
  default     = "eastus"
}

variable "replica_count" {
  description = "AKS node count"
  type        = number
  default     = 2
}

variable "image_tag" {
  description = "Container image tag"
  type        = string
  default     = "latest"
}
