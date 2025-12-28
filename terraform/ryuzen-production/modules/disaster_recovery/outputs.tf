#############################
# Disaster Recovery Module
# Outputs
#############################

output "dr_runbook_arn" {
  description = "DR runbook ARN"
  value       = aws_ssm_document.dr_runbook.arn
}

output "dr_dashboard_name" {
  description = "DR dashboard name"
  value       = aws_cloudwatch_dashboard.dr_status.dashboard_name
}

output "dr_config" {
  description = "DR configuration"
  value = {
    primary_region = data.aws_region.current.name
    dr_region      = var.dr_region
    rpo_hours      = var.dr_rpo_hours
    rto_hours      = var.dr_rto_hours
  }
}
