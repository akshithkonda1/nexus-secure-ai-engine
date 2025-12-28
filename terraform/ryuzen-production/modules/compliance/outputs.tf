#############################
# Compliance Module
# Outputs
#############################

output "enabled_frameworks" {
  description = "List of enabled compliance frameworks"
  value       = local.enabled_frameworks
}

output "compliance_dashboard_name" {
  description = "Compliance dashboard name"
  value       = aws_cloudwatch_dashboard.compliance.dashboard_name
}

output "data_retention_parameter" {
  description = "Data retention SSM parameter"
  value       = aws_ssm_parameter.data_retention_policy.name
}
