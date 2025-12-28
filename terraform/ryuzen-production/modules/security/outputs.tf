#############################
# Security Module
# Outputs
#############################

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.main.id
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.main.arn
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = aws_guardduty_detector.main.id
}

output "security_hub_arn" {
  description = "Security Hub ARN"
  value       = aws_securityhub_account.main.arn
}

output "config_recorder_name" {
  description = "AWS Config recorder name"
  value       = aws_config_configuration_recorder.main.name
}

output "access_analyzer_arn" {
  description = "IAM Access Analyzer ARN"
  value       = aws_accessanalyzer_analyzer.main.arn
}

output "macie_account_id" {
  description = "Macie account ID"
  value       = var.enable_macie ? aws_macie2_account.main[0].id : null
}

output "shield_protection_id" {
  description = "Shield protection ID"
  value       = var.enable_shield_advanced ? aws_shield_protection.alb[0].id : null
}

output "waf_ip_blocklist_arn" {
  description = "WAF IP blocklist ARN"
  value       = aws_wafv2_ip_set.blocklist.arn
}
