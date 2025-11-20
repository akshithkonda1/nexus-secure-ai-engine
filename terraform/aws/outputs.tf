output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.toron.name
}

output "service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.toron.name
}

output "image_uri" {
  description = "Fully qualified ECR image URI"
  value       = aws_ecr_repository.toron.repository_url
}
