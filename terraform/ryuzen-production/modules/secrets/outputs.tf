#############################
# Secrets Module
# Outputs
#############################

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.main.arn
}

output "kms_key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.main.key_id
}

output "kms_key_alias" {
  description = "KMS key alias"
  value       = aws_kms_alias.main.name
}

output "db_credentials_secret_arn" {
  description = "Database credentials secret ARN"
  value       = var.create_db_credentials ? aws_secretsmanager_secret.db_credentials[0].arn : ""
}

output "db_credentials_secret_name" {
  description = "Database credentials secret name"
  value       = var.create_db_credentials ? aws_secretsmanager_secret.db_credentials[0].name : ""
}

output "api_secrets_arns" {
  description = "API secrets ARNs"
  value       = [for s in aws_secretsmanager_secret.api_keys : s.arn]
}

output "api_secrets_names" {
  description = "API secrets names by provider"
  value       = { for k, s in aws_secretsmanager_secret.api_keys : k => s.name }
}

output "oauth_secrets_arn" {
  description = "OAuth secrets ARN"
  value       = aws_secretsmanager_secret.oauth_secrets.arn
}

output "stripe_secret_arn" {
  description = "Stripe secret ARN"
  value       = aws_secretsmanager_secret.stripe.arn
}
