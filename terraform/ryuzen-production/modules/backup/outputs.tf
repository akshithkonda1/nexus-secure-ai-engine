#############################
# Backup Module
# Outputs
#############################

output "primary_vault_arn" {
  description = "Primary backup vault ARN"
  value       = aws_backup_vault.primary.arn
}

output "primary_vault_name" {
  description = "Primary backup vault name"
  value       = aws_backup_vault.primary.name
}

output "secondary_vault_arn" {
  description = "Secondary backup vault ARN (DR)"
  value       = var.enable_cross_region_backup ? aws_backup_vault.secondary[0].arn : null
}

output "backup_plan_id" {
  description = "Backup plan ID"
  value       = aws_backup_plan.production.id
}

output "backup_plan_arn" {
  description = "Backup plan ARN"
  value       = aws_backup_plan.production.arn
}

output "backup_role_arn" {
  description = "IAM role ARN for AWS Backup"
  value       = aws_iam_role.backup.arn
}

output "framework_arn" {
  description = "Backup compliance framework ARN"
  value       = aws_backup_framework.compliance.arn
}

output "report_plan_arn" {
  description = "Backup report plan ARN"
  value       = aws_backup_report_plan.compliance.arn
}
