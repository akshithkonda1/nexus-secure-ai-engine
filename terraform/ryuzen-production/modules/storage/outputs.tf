#############################
# Storage Module
# Outputs
#############################

output "telemetry_bucket_name" {
  description = "Telemetry bucket name"
  value       = aws_s3_bucket.telemetry.id
}

output "telemetry_bucket_arn" {
  description = "Telemetry bucket ARN"
  value       = aws_s3_bucket.telemetry.arn
}

output "backups_bucket_name" {
  description = "Backups bucket name"
  value       = aws_s3_bucket.backups.id
}

output "backups_bucket_arn" {
  description = "Backups bucket ARN"
  value       = aws_s3_bucket.backups.arn
}

output "artifacts_bucket_name" {
  description = "Artifacts bucket name"
  value       = aws_s3_bucket.artifacts.id
}

output "artifacts_bucket_arn" {
  description = "Artifacts bucket ARN"
  value       = aws_s3_bucket.artifacts.arn
}

output "static_assets_bucket_name" {
  description = "Static assets bucket name"
  value       = aws_s3_bucket.static_assets.id
}

output "static_assets_bucket_arn" {
  description = "Static assets bucket ARN"
  value       = aws_s3_bucket.static_assets.arn
}

output "static_assets_bucket_domain_name" {
  description = "Static assets bucket domain name"
  value       = aws_s3_bucket.static_assets.bucket_regional_domain_name
}

output "cloudtrail_bucket_name" {
  description = "CloudTrail bucket name"
  value       = aws_s3_bucket.cloudtrail.id
}

output "cloudtrail_bucket_arn" {
  description = "CloudTrail bucket ARN"
  value       = aws_s3_bucket.cloudtrail.arn
}

output "config_bucket_name" {
  description = "Config bucket name"
  value       = aws_s3_bucket.config.id
}

output "config_bucket_arn" {
  description = "Config bucket ARN"
  value       = aws_s3_bucket.config.arn
}
