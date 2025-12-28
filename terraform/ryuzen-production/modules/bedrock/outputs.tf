#############################
# Bedrock Module
# Outputs
#############################

output "bedrock_policy_arn" {
  description = "Bedrock IAM policy ARN"
  value       = aws_iam_policy.bedrock_invoke.arn
}

output "enabled_models" {
  description = "List of enabled Bedrock models"
  value       = var.bedrock_models
}

output "log_group_name" {
  description = "Bedrock log group name"
  value       = aws_cloudwatch_log_group.bedrock.name
}

#---------------------------
# Guardrails Outputs
#---------------------------

output "guardrail_id" {
  description = "Bedrock Guardrail ID"
  value       = aws_bedrock_guardrail.production.guardrail_id
}

output "guardrail_arn" {
  description = "Bedrock Guardrail ARN"
  value       = aws_bedrock_guardrail.production.guardrail_arn
}

output "guardrail_version" {
  description = "Bedrock Guardrail version"
  value       = aws_bedrock_guardrail_version.production_v1.version
}

output "guardrail_status" {
  description = "Bedrock Guardrail status"
  value       = aws_bedrock_guardrail.production.status
}

output "guardrail_apply_policy_arn" {
  description = "IAM policy ARN for applying guardrails"
  value       = aws_iam_policy.guardrail_apply.arn
}

#---------------------------
# Logging Outputs
#---------------------------

output "guardrail_blocks_log_group" {
  description = "CloudWatch log group for guardrail blocks"
  value       = aws_cloudwatch_log_group.guardrail_blocks.name
}

output "model_invocations_log_group" {
  description = "CloudWatch log group for model invocations"
  value       = aws_cloudwatch_log_group.model_invocations.name
}

output "disclaimer_events_log_group" {
  description = "CloudWatch log group for disclaimer events"
  value       = aws_cloudwatch_log_group.disclaimer_events.name
}

#---------------------------
# Dashboard Outputs
#---------------------------

output "guardrails_dashboard_name" {
  description = "CloudWatch dashboard name for guardrails monitoring"
  value       = aws_cloudwatch_dashboard.guardrails.dashboard_name
}
