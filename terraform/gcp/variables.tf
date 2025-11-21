variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "toron-demo"
}

variable "region" {
  description = "GCP region for GKE and Artifact Registry"
  type        = string
  default     = "us-central1"
}

variable "replica_count" {
  description = "GKE node pool size"
  type        = number
  default     = 2
}

variable "image_tag" {
  description = "Container image tag"
  type        = string
  default     = "latest"
}
