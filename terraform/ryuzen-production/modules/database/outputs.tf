#############################
# Database Module
# Outputs
#############################

#---------------------------
# DynamoDB Outputs
#---------------------------
output "dynamodb_table_names" {
  description = "Map of DynamoDB table names"
  value = var.deploy_dynamodb ? {
    tier1_cache = aws_dynamodb_table.tier1_cache[0].name
    tier3_cache = aws_dynamodb_table.tier3_cache[0].name
    sessions    = aws_dynamodb_table.sessions[0].name
  } : {}
}

output "dynamodb_table_arns" {
  description = "List of DynamoDB table ARNs"
  value = var.deploy_dynamodb ? [
    aws_dynamodb_table.tier1_cache[0].arn,
    aws_dynamodb_table.tier3_cache[0].arn,
    aws_dynamodb_table.sessions[0].arn
  ] : []
}

output "dynamodb_tier1_cache_name" {
  description = "Tier 1 cache table name"
  value       = var.deploy_dynamodb ? aws_dynamodb_table.tier1_cache[0].name : ""
}

output "dynamodb_tier3_cache_name" {
  description = "Tier 3 cache table name"
  value       = var.deploy_dynamodb ? aws_dynamodb_table.tier3_cache[0].name : ""
}

output "dynamodb_stream_arns" {
  description = "DynamoDB stream ARNs"
  value = var.deploy_dynamodb ? {
    tier1_cache = aws_dynamodb_table.tier1_cache[0].stream_arn
    tier3_cache = aws_dynamodb_table.tier3_cache[0].stream_arn
  } : {}
}

#---------------------------
# Aurora Outputs
#---------------------------
output "rds_cluster_arn" {
  description = "Aurora cluster ARN"
  value       = var.deploy_aurora ? aws_rds_cluster.main[0].arn : ""
}

output "rds_cluster_identifier" {
  description = "Aurora cluster identifier"
  value       = var.deploy_aurora ? aws_rds_cluster.main[0].cluster_identifier : ""
}

output "rds_cluster_endpoint" {
  description = "Aurora cluster endpoint"
  value       = var.deploy_aurora ? aws_rds_cluster.main[0].endpoint : ""
}

output "rds_cluster_reader_endpoint" {
  description = "Aurora cluster reader endpoint"
  value       = var.deploy_aurora ? aws_rds_cluster.main[0].reader_endpoint : ""
}

output "rds_cluster_port" {
  description = "Aurora cluster port"
  value       = var.deploy_aurora ? aws_rds_cluster.main[0].port : 5432
}

output "rds_cluster_database_name" {
  description = "Aurora cluster database name"
  value       = var.deploy_aurora ? aws_rds_cluster.main[0].database_name : ""
}

#---------------------------
# RDS Proxy Outputs
#---------------------------
output "rds_proxy_endpoint" {
  description = "RDS Proxy endpoint"
  value       = var.deploy_aurora && var.enable_rds_proxy ? aws_db_proxy.main[0].endpoint : ""
}

output "rds_proxy_arn" {
  description = "RDS Proxy ARN"
  value       = var.deploy_aurora && var.enable_rds_proxy ? aws_db_proxy.main[0].arn : ""
}

#---------------------------
# Security Group Outputs
#---------------------------
output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = var.deploy_aurora ? aws_security_group.rds[0].id : ""
}

output "rds_proxy_security_group_id" {
  description = "RDS Proxy security group ID"
  value       = var.deploy_aurora && var.enable_rds_proxy ? aws_security_group.db_proxy[0].id : ""
}
