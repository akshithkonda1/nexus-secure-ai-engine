#############################
# DNS Module
# Outputs
#############################

output "zone_id" {
  description = "Route 53 zone ID"
  value       = local.zone_id
}

output "nameservers" {
  description = "Route 53 nameservers"
  value       = var.create_dns_zone ? aws_route53_zone.main[0].name_servers : []
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate.main.arn
}

output "acm_certificate_status" {
  description = "ACM certificate status"
  value       = aws_acm_certificate.main.status
}

output "api_fqdn" {
  description = "API FQDN"
  value       = var.alb_dns_name != "" ? "${var.api_subdomain}.${var.domain_name}" : ""
}

output "workspace_fqdn" {
  description = "Workspace FQDN"
  value       = var.cloudfront_domain_name != "" ? "${var.workspace_subdomain}.${var.domain_name}" : ""
}

output "health_check_id" {
  description = "API health check ID"
  value       = var.alb_dns_name != "" ? aws_route53_health_check.api[0].id : ""
}
