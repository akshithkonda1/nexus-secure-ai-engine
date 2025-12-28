#############################
# Monitoring Module
# Outputs
#############################

output "critical_alerts_topic_arn" {
  description = "Critical alerts SNS topic ARN"
  value       = aws_sns_topic.critical_alerts.arn
}

output "alerts_topic_arn" {
  description = "Alerts SNS topic ARN"
  value       = aws_sns_topic.alerts.arn
}

output "cloudtrail_arn" {
  description = "CloudTrail ARN"
  value       = aws_cloudtrail.main.arn
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = var.enable_guardduty ? aws_guardduty_detector.main[0].id : ""
}

output "log_group_names" {
  description = "CloudWatch log group names"
  value = {
    cloudtrail = "/aws/cloudtrail/${var.name_prefix}"
  }
}
