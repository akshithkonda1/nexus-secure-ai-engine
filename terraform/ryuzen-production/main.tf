#############################
# Ryuzen Production Infrastructure
# Root Module Orchestration
#############################
#
# Enterprise-grade infrastructure for TORON epistemic AI engine
# and Ryuzen Workspace productivity suite.
#
# Architecture:
# - Multi-AZ VPC with private subnets
# - Serverless compute (AWS Lambda)
# - Dual database strategy (DynamoDB + Aurora PostgreSQL)
# - AWS Bedrock for AI models
# - Comprehensive monitoring and security
#
#############################

# Data sources
data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

# Local values
locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name

  availability_zones = var.enable_third_az ? slice(data.aws_availability_zones.available.names, 0, 3) : slice(data.aws_availability_zones.available.names, 0, 2)

  common_tags = merge(
    {
      Project     = "Ryuzen"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Akshith"
      CostCenter  = "TORON"
    },
    var.additional_tags
  )

  name_prefix = "${var.name_prefix}-${var.environment}"

  # Determine if this is a production-like environment
  is_production = var.environment == "production" || var.environment == "gov-cloud"
}

#---------------------------
# Networking Module
#---------------------------
module "networking" {
  source = "./modules/networking"

  name_prefix        = local.name_prefix
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = local.availability_zones

  # NAT Gateway configuration
  enable_nat_gateway_ha = var.enable_nat_gateway_ha

  # VPC Endpoints
  vpc_endpoint_services          = var.vpc_endpoint_services
  enable_vpc_endpoint_cloudwatch = var.enable_vpc_endpoint_cloudwatch

  # WAF configuration
  enable_waf             = var.enable_waf
  waf_rate_limit         = var.waf_rate_limit
  waf_blocked_countries  = var.waf_blocked_countries

  # DNS configuration
  domain_name       = var.domain_name
  api_subdomain     = var.api_subdomain
  route53_zone_id   = var.route53_zone_id

  tags = local.common_tags
}

#---------------------------
# Secrets Module
#---------------------------
module "secrets" {
  source = "./modules/secrets"

  name_prefix           = local.name_prefix
  environment           = var.environment
  kms_key_deletion_window = var.kms_key_deletion_window

  # External API providers
  external_api_providers = var.external_api_providers

  # Database credentials
  create_db_credentials = var.features.deploy_aurora

  tags = local.common_tags
}

#---------------------------
# Database Module
#---------------------------
module "database" {
  source = "./modules/database"

  count = var.features.deploy_aurora || var.features.deploy_dynamodb ? 1 : 0

  name_prefix = local.name_prefix
  environment = var.environment
  account_id  = local.account_id

  # VPC configuration
  vpc_id                 = module.networking.vpc_id
  database_subnet_ids    = module.networking.database_subnet_ids
  private_subnet_ids     = module.networking.private_subnet_ids
  lambda_security_group_id = module.networking.lambda_security_group_id

  # Aurora configuration
  deploy_aurora             = var.features.deploy_aurora
  aurora_min_capacity       = var.aurora_min_capacity
  aurora_max_capacity       = var.aurora_max_capacity
  aurora_instance_count     = var.aurora_instance_count
  aurora_backup_retention   = var.aurora_backup_retention
  enable_rds_proxy          = var.enable_rds_proxy
  db_credentials_secret_arn = module.secrets.db_credentials_secret_arn

  # DynamoDB configuration
  deploy_dynamodb                = var.features.deploy_dynamodb
  dynamodb_billing_mode          = var.dynamodb_billing_mode
  enable_dynamodb_global_tables  = var.enable_dynamodb_global_tables
  dr_region                      = var.dr_region

  # Encryption
  kms_key_arn = module.secrets.kms_key_arn

  tags = local.common_tags
}

#---------------------------
# Storage Module
#---------------------------
module "storage" {
  source = "./modules/storage"

  name_prefix = local.name_prefix
  environment = var.environment
  account_id  = local.account_id

  # Lifecycle configuration
  telemetry_retention_days = var.telemetry_retention_days
  backup_retention_days    = var.backup_retention_days

  # Cross-region replication
  enable_cross_region_replication = var.enable_s3_cross_region_replication
  dr_region                       = var.dr_region

  # Encryption
  kms_key_arn = module.secrets.kms_key_arn

  # Safety
  force_destroy = var.s3_force_destroy

  tags = local.common_tags
}

#---------------------------
# Compute Module (Lambda)
#---------------------------
module "compute" {
  source = "./modules/compute"

  name_prefix = local.name_prefix
  environment = var.environment

  # VPC configuration
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  lambda_security_group_id = module.networking.lambda_security_group_id

  # Lambda configuration
  lambda_runtime = var.lambda_runtime

  # TORON Lambda
  deploy_toron_lambda           = var.features.deploy_toron_lambda
  lambda_memory_toron           = var.lambda_memory_toron
  lambda_timeout_toron          = var.lambda_timeout_toron
  provisioned_concurrency_toron = var.enable_provisioned_concurrency ? var.provisioned_concurrency_toron : 0
  reserved_concurrency_toron    = var.reserved_concurrency_toron

  # Workspace Lambda
  deploy_workspace_lambda           = var.features.deploy_workspace_lambda
  lambda_memory_workspace           = var.lambda_memory_workspace
  lambda_timeout_workspace          = var.lambda_timeout_workspace
  provisioned_concurrency_workspace = var.enable_provisioned_concurrency ? var.provisioned_concurrency_workspace : 0

  # OAuth Lambda
  deploy_oauth_lambda = var.features.deploy_oauth_lambda

  # Telemetry Lambda
  deploy_telemetry_lambda = var.features.deploy_telemetry_lambda

  # X-Ray tracing
  enable_xray_tracing = var.enable_xray_tracing

  # IAM and secrets
  secrets_kms_key_arn     = module.secrets.kms_key_arn
  api_secrets_arns        = module.secrets.api_secrets_arns
  db_credentials_secret_arn = module.secrets.db_credentials_secret_arn

  # Database access
  dynamodb_table_arns = var.features.deploy_dynamodb ? module.database[0].dynamodb_table_arns : []
  rds_cluster_arn     = var.features.deploy_aurora ? module.database[0].rds_cluster_arn : ""
  rds_proxy_endpoint  = var.features.deploy_aurora && var.enable_rds_proxy ? module.database[0].rds_proxy_endpoint : ""

  # S3 access
  telemetry_bucket_arn = module.storage.telemetry_bucket_arn
  artifacts_bucket_arn = module.storage.artifacts_bucket_arn

  # Bedrock models
  bedrock_models = var.bedrock_models

  # ALB target group
  alb_target_group_arn = module.networking.alb_target_group_arn

  tags = local.common_tags
}

#---------------------------
# Bedrock Module
#---------------------------
module "bedrock" {
  source = "./modules/bedrock"

  name_prefix = local.name_prefix
  environment = var.environment

  # Enabled models
  bedrock_models = var.bedrock_models

  # Lambda role to grant access
  lambda_role_arn = module.compute.lambda_execution_role_arn

  tags = local.common_tags
}

#---------------------------
# DNS Module
#---------------------------
module "dns" {
  source = "./modules/dns"

  count = var.route53_zone_id != "" || var.create_dns_zone ? 1 : 0

  name_prefix   = local.name_prefix
  environment   = var.environment
  domain_name   = var.domain_name
  api_subdomain = var.api_subdomain
  workspace_subdomain = var.workspace_subdomain

  # Route 53 configuration
  route53_zone_id  = var.route53_zone_id
  create_dns_zone  = var.create_dns_zone

  # ALB for API
  alb_dns_name    = module.networking.alb_dns_name
  alb_zone_id     = module.networking.alb_zone_id

  # CloudFront for Workspace (if deployed)
  cloudfront_domain_name = var.features.deploy_cloudfront ? module.cdn[0].cloudfront_domain_name : ""
  cloudfront_zone_id     = var.features.deploy_cloudfront ? module.cdn[0].cloudfront_hosted_zone_id : ""

  tags = local.common_tags

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

#---------------------------
# CDN Module (CloudFront)
#---------------------------
module "cdn" {
  source = "./modules/cdn"

  count = var.features.deploy_cloudfront ? 1 : 0

  name_prefix = local.name_prefix
  environment = var.environment
  domain_name = var.domain_name
  workspace_subdomain = var.workspace_subdomain

  # S3 origin
  static_assets_bucket_arn         = module.storage.static_assets_bucket_arn
  static_assets_bucket_domain_name = module.storage.static_assets_bucket_domain_name
  static_assets_bucket_id          = module.storage.static_assets_bucket_id

  # SSL certificate (must be in us-east-1)
  acm_certificate_arn = length(module.dns) > 0 ? module.dns[0].acm_certificate_arn : ""

  # WAF (optional)
  web_acl_arn = var.enable_waf ? module.networking.web_acl_arn : ""

  tags = local.common_tags

  providers = {
    aws = aws.us_east_1
  }
}

#---------------------------
# Monitoring Module
#---------------------------
module "monitoring" {
  source = "./modules/monitoring"

  count = var.features.deploy_monitoring ? 1 : 0

  name_prefix = local.name_prefix
  environment = var.environment
  account_id  = local.account_id

  # Alert destinations
  alarm_email         = var.alarm_email
  critical_alarm_phone = var.critical_alarm_phone
  pagerduty_endpoint  = var.pagerduty_endpoint
  slack_webhook_url   = var.slack_webhook_url

  # Log configuration
  log_retention_days = var.log_retention_days

  # X-Ray configuration
  enable_xray_tracing = var.enable_xray_tracing
  xray_sampling_rate  = var.xray_sampling_rate

  # Lambda functions to monitor
  lambda_function_names = module.compute.lambda_function_names
  lambda_function_arns  = module.compute.lambda_function_arns

  # ALB to monitor
  alb_arn_suffix         = module.networking.alb_arn_suffix
  target_group_arn_suffix = module.networking.target_group_arn_suffix

  # Database to monitor
  rds_cluster_identifier = var.features.deploy_aurora ? module.database[0].rds_cluster_identifier : ""
  dynamodb_table_names   = var.features.deploy_dynamodb ? module.database[0].dynamodb_table_names : []

  # Security monitoring
  enable_guardduty    = var.enable_guardduty
  enable_security_hub = var.enable_security_hub

  # S3 buckets for logs
  cloudtrail_bucket_arn = module.storage.cloudtrail_bucket_arn
  config_bucket_arn     = module.storage.config_bucket_arn

  # KMS key
  kms_key_arn = module.secrets.kms_key_arn

  tags = local.common_tags
}

#---------------------------
# Security Module
#---------------------------
module "security" {
  source = "./modules/security"

  name_prefix = local.name_prefix
  environment = var.environment

  # VPC
  vpc_id = module.networking.vpc_id

  # WAF
  enable_waf = var.enable_waf
  alb_arn    = module.networking.alb_arn

  # Shield
  enable_shield_advanced = var.enable_shield_advanced

  # GuardDuty and Security Hub (handled in monitoring module)

  tags = local.common_tags
}

#---------------------------
# Backup Module
#---------------------------
module "backup" {
  source = "./modules/backup"

  name_prefix = local.name_prefix
  environment = var.environment

  # Backup retention
  backup_retention_days = var.backup_retention_days

  # Resources to backup
  rds_cluster_arn      = var.features.deploy_aurora ? module.database[0].rds_cluster_arn : ""
  dynamodb_table_arns  = var.features.deploy_dynamodb ? module.database[0].dynamodb_table_arns : []
  s3_bucket_arns       = [module.storage.telemetry_bucket_arn, module.storage.backups_bucket_arn]

  # KMS key
  kms_key_arn = module.secrets.kms_key_arn

  tags = local.common_tags
}

#---------------------------
# Disaster Recovery Module
#---------------------------
module "disaster_recovery" {
  source = "./modules/disaster_recovery"

  count = var.enable_dr ? 1 : 0

  name_prefix = local.name_prefix
  environment = var.environment
  dr_region   = var.dr_region

  # RPO/RTO targets
  dr_rpo_hours = var.dr_rpo_hours
  dr_rto_hours = var.dr_rto_hours

  # Primary resources
  primary_vpc_id      = module.networking.vpc_id
  primary_s3_buckets  = [module.storage.telemetry_bucket_arn, module.storage.backups_bucket_arn]
  primary_rds_cluster = var.features.deploy_aurora ? module.database[0].rds_cluster_arn : ""

  # KMS key
  kms_key_arn = module.secrets.kms_key_arn

  tags = local.common_tags

  providers = {
    aws           = aws
    aws.dr_region = aws.dr_region
  }
}

#---------------------------
# Compliance Module
#---------------------------
module "compliance" {
  source = "./modules/compliance"

  name_prefix = local.name_prefix
  environment = var.environment

  # Compliance frameworks
  compliance_frameworks = var.compliance_frameworks
  enable_hipaa          = var.enable_hipaa
  enable_fedramp        = var.enable_fedramp

  # Data retention
  telemetry_retention_days = var.telemetry_retention_days

  # KMS key for encryption
  kms_key_arn = module.secrets.kms_key_arn

  # CloudTrail for audit
  cloudtrail_bucket_arn = module.storage.cloudtrail_bucket_arn

  tags = local.common_tags
}
