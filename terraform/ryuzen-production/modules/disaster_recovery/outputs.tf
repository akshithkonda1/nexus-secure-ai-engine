#############################
# Disaster Recovery Module
# Outputs
#############################

output "dr_failover_function_name" {
  description = "DR failover Lambda function name"
  value       = aws_lambda_function.dr_failover.function_name
}

output "dr_failover_function_arn" {
  description = "DR failover Lambda function ARN"
  value       = aws_lambda_function.dr_failover.arn
}

output "dr_test_function_name" {
  description = "DR test Lambda function name"
  value       = aws_lambda_function.dr_test.function_name
}

output "dr_test_function_arn" {
  description = "DR test Lambda function ARN"
  value       = aws_lambda_function.dr_test.arn
}

output "dr_runbook_arn" {
  description = "DR runbook ARN"
  value       = aws_ssm_document.dr_runbook.arn
}

output "dr_dashboard_name" {
  description = "DR dashboard name"
  value       = aws_cloudwatch_dashboard.dr_status.dashboard_name
}

output "dr_operations_log_group" {
  description = "DR operations log group name"
  value       = aws_cloudwatch_log_group.dr_operations.name
}

output "s3_replication_role_arn" {
  description = "S3 replication IAM role ARN"
  value       = var.enable_s3_replication ? aws_iam_role.s3_replication[0].arn : null
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
