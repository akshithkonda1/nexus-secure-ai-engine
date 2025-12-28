#############################
# Security Module
# Outputs
#############################

output "access_analyzer_arn" {
  description = "IAM Access Analyzer ARN"
  value       = aws_accessanalyzer_analyzer.main.arn
}

output "shield_protection_id" {
  description = "Shield protection ID"
  value       = var.enable_shield_advanced ? aws_shield_protection.alb[0].id : ""
}
