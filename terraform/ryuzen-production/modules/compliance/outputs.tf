#############################
# Compliance Module
# Outputs
#############################

output "enabled_frameworks" {
  description = "List of enabled compliance frameworks"
  value       = local.enabled_frameworks
}

output "gdpr_consent_table_name" {
  description = "DynamoDB table name for GDPR consent records"
  value       = var.enable_gdpr ? aws_dynamodb_table.gdpr_consent[0].name : null
}

output "gdpr_consent_table_arn" {
  description = "DynamoDB table ARN for GDPR consent records"
  value       = var.enable_gdpr ? aws_dynamodb_table.gdpr_consent[0].arn : null
}

output "gdpr_erasure_function_name" {
  description = "Lambda function name for GDPR right to erasure"
  value       = var.enable_gdpr ? aws_lambda_function.gdpr_erasure[0].function_name : null
}

output "gdpr_erasure_function_arn" {
  description = "Lambda function ARN for GDPR right to erasure"
  value       = var.enable_gdpr ? aws_lambda_function.gdpr_erasure[0].arn : null
}

output "hipaa_audit_trail_arn" {
  description = "CloudTrail ARN for HIPAA audit logging"
  value       = var.enable_hipaa ? aws_cloudtrail.hipaa_audit[0].arn : null
}

output "hipaa_audit_log_group" {
  description = "CloudWatch log group for HIPAA audit"
  value       = var.enable_hipaa ? aws_cloudwatch_log_group.hipaa_audit[0].name : null
}

output "soc2_evidence_bucket_name" {
  description = "S3 bucket name for SOC2 audit evidence"
  value       = var.enable_soc2 ? aws_s3_bucket.soc2_evidence[0].id : null
}

output "soc2_evidence_bucket_arn" {
  description = "S3 bucket ARN for SOC2 audit evidence"
  value       = var.enable_soc2 ? aws_s3_bucket.soc2_evidence[0].arn : null
}

output "compliance_report_function_name" {
  description = "Lambda function name for compliance reporting"
  value       = aws_lambda_function.compliance_report.function_name
}

output "compliance_report_function_arn" {
  description = "Lambda function ARN for compliance reporting"
  value       = aws_lambda_function.compliance_report.arn
}

output "compliance_dashboard_name" {
  description = "Compliance dashboard name"
  value       = aws_cloudwatch_dashboard.compliance.dashboard_name
}

output "data_retention_parameter" {
  description = "Data retention SSM parameter"
  value       = aws_ssm_parameter.data_retention_policy.name
}
