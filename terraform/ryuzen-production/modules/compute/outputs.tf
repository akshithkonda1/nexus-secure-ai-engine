#############################
# Compute Module
# Outputs
#############################

output "lambda_function_names" {
  description = "Map of Lambda function names"
  value = {
    toron     = var.deploy_toron_lambda ? aws_lambda_function.toron[0].function_name : ""
    workspace = var.deploy_workspace_lambda ? aws_lambda_function.workspace[0].function_name : ""
    oauth     = var.deploy_oauth_lambda ? aws_lambda_function.oauth[0].function_name : ""
    telemetry = var.deploy_telemetry_lambda ? aws_lambda_function.telemetry[0].function_name : ""
  }
}

output "lambda_function_arns" {
  description = "Map of Lambda function ARNs"
  value = {
    toron     = var.deploy_toron_lambda ? aws_lambda_function.toron[0].arn : ""
    workspace = var.deploy_workspace_lambda ? aws_lambda_function.workspace[0].arn : ""
    oauth     = var.deploy_oauth_lambda ? aws_lambda_function.oauth[0].arn : ""
    telemetry = var.deploy_telemetry_lambda ? aws_lambda_function.telemetry[0].arn : ""
  }
}

output "lambda_invoke_arns" {
  description = "Map of Lambda invoke ARNs"
  value = {
    toron     = var.deploy_toron_lambda ? aws_lambda_function.toron[0].invoke_arn : ""
    workspace = var.deploy_workspace_lambda ? aws_lambda_function.workspace[0].invoke_arn : ""
    oauth     = var.deploy_oauth_lambda ? aws_lambda_function.oauth[0].invoke_arn : ""
    telemetry = var.deploy_telemetry_lambda ? aws_lambda_function.telemetry[0].invoke_arn : ""
  }
}

output "lambda_alias_arns" {
  description = "Map of Lambda alias ARNs (for ALB integration)"
  value = {
    toron     = var.deploy_toron_lambda ? aws_lambda_alias.toron_live[0].arn : ""
    workspace = var.deploy_workspace_lambda ? aws_lambda_alias.workspace_live[0].arn : ""
    oauth     = var.deploy_oauth_lambda ? aws_lambda_alias.oauth_live[0].arn : ""
  }
}

output "lambda_execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution.arn
}

output "lambda_execution_role_name" {
  description = "Lambda execution role name"
  value       = aws_iam_role.lambda_execution.name
}

output "lambda_layer_arn" {
  description = "Lambda layer ARN for Python dependencies"
  value       = aws_lambda_layer_version.python_dependencies.arn
}

output "dlq_arn" {
  description = "Dead letter queue ARN"
  value       = aws_sqs_queue.lambda_dlq.arn
}

output "dlq_url" {
  description = "Dead letter queue URL"
  value       = aws_sqs_queue.lambda_dlq.url
}

output "reprocess_queue_arn" {
  description = "Reprocess queue ARN"
  value       = aws_sqs_queue.reprocess.arn
}

output "reprocess_queue_url" {
  description = "Reprocess queue URL"
  value       = aws_sqs_queue.reprocess.url
}
