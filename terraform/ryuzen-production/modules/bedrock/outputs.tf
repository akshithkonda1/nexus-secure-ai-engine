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
