output "cluster_endpoint" {
  description = "GKE control plane endpoint"
  value       = google_container_cluster.toron.endpoint
}

output "artifact_registry_repo" {
  description = "Artifact Registry repository path"
  value       = google_artifact_registry_repository.toron.repository_id
}

output "service_account_email" {
  description = "Service account used by node pool"
  value       = google_service_account.toron.email
}

output "image_uri" {
  description = "Sample Artifact Registry image URI"
  value       = format("%s-docker.pkg.dev/%s/%s/toron:%s", var.region, var.project_id, google_artifact_registry_repository.toron.repository_id, var.image_tag)
}
