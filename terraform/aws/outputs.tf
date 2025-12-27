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

output "api_url" {
  description = "TORON API URL"
  value       = var.route53_zone_id != "" ? "https://${var.api_subdomain}.${var.domain_name}" : "http://${aws_lb.toron.dns_name}"
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.toron.dns_name
}
