#############################
# Ryuzen Production Infrastructure
# Global Outputs
#############################

#---------------------------
# Environment Information
#---------------------------

output "environment" {
  description = "Deployment environment"
  value       = var.environment
}

output "aws_region" {
  description = "Primary AWS region"
  value       = local.region
}

output "aws_account_id" {
  description = "AWS account ID"
  value       = local.account_id
}

output "name_prefix" {
  description = "Resource naming prefix"
  value       = local.name_prefix
}

#---------------------------
# Networking Outputs
#---------------------------

output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = module.networking.vpc_cidr
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.networking.private_subnet_ids
}

output "database_subnet_ids" {
  description = "Database subnet IDs"
  value       = module.networking.database_subnet_ids
}

output "nat_gateway_ips" {
  description = "NAT Gateway public IPs"
  value       = module.networking.nat_gateway_ips
}

#---------------------------
# Load Balancer Outputs
#---------------------------

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.networking.alb_dns_name
}

output "alb_zone_id" {
  description = "ALB Route 53 zone ID"
  value       = module.networking.alb_zone_id
}

output "alb_arn" {
  description = "ALB ARN"
  value       = module.networking.alb_arn
}

#---------------------------
# API Endpoints
#---------------------------

output "api_endpoint" {
  description = "TORON API endpoint URL"
  value       = length(module.dns) > 0 ? "https://${var.api_subdomain}.${var.domain_name}" : "https://${module.networking.alb_dns_name}"
}

output "workspace_endpoint" {
  description = "Workspace application endpoint URL"
  value       = var.features.deploy_cloudfront && length(module.cdn) > 0 ? "https://${var.workspace_subdomain}.${var.domain_name}" : ""
}

#---------------------------
# Lambda Outputs
#---------------------------

output "lambda_function_names" {
  description = "Lambda function names"
  value       = module.compute.lambda_function_names
}

output "lambda_function_arns" {
  description = "Lambda function ARNs"
  value       = module.compute.lambda_function_arns
}

output "lambda_execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = module.compute.lambda_execution_role_arn
}

#---------------------------
# Database Outputs
#---------------------------

output "rds_cluster_endpoint" {
  description = "Aurora PostgreSQL cluster endpoint"
  value       = var.features.deploy_aurora && length(module.database) > 0 ? module.database[0].rds_cluster_endpoint : ""
}

output "rds_cluster_reader_endpoint" {
  description = "Aurora PostgreSQL reader endpoint"
  value       = var.features.deploy_aurora && length(module.database) > 0 ? module.database[0].rds_cluster_reader_endpoint : ""
}

output "rds_proxy_endpoint" {
  description = "RDS Proxy endpoint for connection pooling"
  value       = var.features.deploy_aurora && var.enable_rds_proxy && length(module.database) > 0 ? module.database[0].rds_proxy_endpoint : ""
}

output "dynamodb_table_names" {
  description = "DynamoDB table names"
  value       = var.features.deploy_dynamodb && length(module.database) > 0 ? module.database[0].dynamodb_table_names : {}
}

output "dynamodb_table_arns" {
  description = "DynamoDB table ARNs"
  value       = var.features.deploy_dynamodb && length(module.database) > 0 ? module.database[0].dynamodb_table_arns : []
}

#---------------------------
# Storage Outputs
#---------------------------

output "s3_bucket_names" {
  description = "S3 bucket names"
  value = {
    telemetry     = module.storage.telemetry_bucket_name
    backups       = module.storage.backups_bucket_name
    artifacts     = module.storage.artifacts_bucket_name
    static_assets = module.storage.static_assets_bucket_name
    cloudtrail    = module.storage.cloudtrail_bucket_name
  }
}

output "s3_bucket_arns" {
  description = "S3 bucket ARNs"
  value = {
    telemetry     = module.storage.telemetry_bucket_arn
    backups       = module.storage.backups_bucket_arn
    artifacts     = module.storage.artifacts_bucket_arn
    static_assets = module.storage.static_assets_bucket_arn
    cloudtrail    = module.storage.cloudtrail_bucket_arn
  }
}

#---------------------------
# Secrets Outputs
#---------------------------

output "kms_key_arn" {
  description = "KMS key ARN for encryption"
  value       = module.secrets.kms_key_arn
}

output "kms_key_id" {
  description = "KMS key ID"
  value       = module.secrets.kms_key_id
}

output "db_credentials_secret_arn" {
  description = "Database credentials secret ARN"
  value       = module.secrets.db_credentials_secret_arn
  sensitive   = true
}

#---------------------------
# CDN Outputs
#---------------------------

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.features.deploy_cloudfront && length(module.cdn) > 0 ? module.cdn[0].distribution_id : ""
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = var.features.deploy_cloudfront && length(module.cdn) > 0 ? module.cdn[0].cloudfront_domain_name : ""
}

#---------------------------
# Monitoring Outputs
#---------------------------

output "sns_critical_alerts_topic_arn" {
  description = "SNS topic for critical alerts"
  value       = var.features.deploy_monitoring && length(module.monitoring) > 0 ? module.monitoring[0].critical_alerts_topic_arn : ""
}

output "sns_alerts_topic_arn" {
  description = "SNS topic for standard alerts"
  value       = var.features.deploy_monitoring && length(module.monitoring) > 0 ? module.monitoring[0].alerts_topic_arn : ""
}

output "cloudwatch_log_group_names" {
  description = "CloudWatch log group names"
  value       = var.features.deploy_monitoring && length(module.monitoring) > 0 ? module.monitoring[0].log_group_names : {}
}

#---------------------------
# Security Outputs
#---------------------------

output "web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = var.enable_waf ? module.networking.web_acl_arn : ""
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = var.enable_guardduty && var.features.deploy_monitoring && length(module.monitoring) > 0 ? module.monitoring[0].guardduty_detector_id : ""
}

#---------------------------
# DNS Outputs
#---------------------------

output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = length(module.dns) > 0 ? module.dns[0].zone_id : ""
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = length(module.dns) > 0 ? module.dns[0].acm_certificate_arn : ""
}

output "nameservers" {
  description = "Route 53 nameservers (if zone was created)"
  value       = length(module.dns) > 0 ? module.dns[0].nameservers : []
}

#---------------------------
# Backup Outputs
#---------------------------

output "backup_vault_arn" {
  description = "AWS Backup vault ARN"
  value       = module.backup.backup_vault_arn
}

output "backup_plan_id" {
  description = "AWS Backup plan ID"
  value       = module.backup.backup_plan_id
}

#---------------------------
# Cost Estimation
#---------------------------

output "estimated_monthly_cost" {
  description = "Estimated monthly infrastructure cost (USD)"
  value = {
    note = "This is a rough estimate. Actual costs depend on usage."
    lambda = {
      description = "Lambda invocations and duration"
      estimate    = "$15-50/month at beta scale"
    }
    aurora = {
      description = "Aurora Serverless v2 (0.5-16 ACU)"
      estimate    = "$50-200/month at beta scale"
    }
    dynamodb = {
      description = "DynamoDB on-demand"
      estimate    = "$2-10/month at beta scale"
    }
    networking = {
      description = "NAT Gateway, ALB, VPC endpoints"
      estimate    = "$50-100/month"
    }
    storage = {
      description = "S3 storage and requests"
      estimate    = "$5-15/month at beta scale"
    }
    monitoring = {
      description = "CloudWatch, X-Ray, CloudTrail"
      estimate    = "$15-30/month"
    }
    total = {
      description = "Estimated total"
      estimate    = "$150-400/month at beta scale"
    }
  }
}

#---------------------------
# Deployment Information
#---------------------------

output "deployment_info" {
  description = "Deployment information and next steps"
  value = {
    deployed_at    = timestamp()
    terraform_version = ">=1.6.0"
    next_steps = [
      "1. Validate DNS configuration if using custom domain",
      "2. Deploy Lambda function code using CI/CD pipeline",
      "3. Configure external API keys in Secrets Manager",
      "4. Test API endpoint: ${length(module.dns) > 0 ? "https://${var.api_subdomain}.${var.domain_name}/health" : "https://${module.networking.alb_dns_name}/health"}",
      "5. Review CloudWatch dashboards for monitoring",
      "6. Subscribe to SNS topics for alerts"
    ]
  }
}
