#############################
# GCP Toron IaC
# Provisions GKE cluster, Artifact Registry, and service account.
#############################

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "toron-tf-state"
    prefix = "gcp"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Artifact Registry to host container images
resource "google_artifact_registry_repository" "toron" {
  location       = var.region
  repository_id  = "toron-engine"
  description    = "Toron container images"
  format         = "DOCKER"
}

resource "google_service_account" "toron" {
  account_id   = "toron-engine"
  display_name = "Toron Engine"
}

# GKE control plane
resource "google_container_cluster" "toron" {
  name     = "toron-gke"
  location = var.region
  remove_default_node_pool = true
  initial_node_count       = 1

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
}

resource "google_container_node_pool" "toron" {
  name       = "toron-nodes"
  location   = var.region
  cluster    = google_container_cluster.toron.name
  node_count = var.replica_count

  node_config {
    machine_type = "e2-medium"
    service_account = google_service_account.toron.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }
}
