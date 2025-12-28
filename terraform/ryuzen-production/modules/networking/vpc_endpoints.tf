#############################
# Networking Module
# VPC Endpoints
#############################

# Gateway endpoints (FREE)

#---------------------------
# S3 Gateway Endpoint
#---------------------------
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = concat(aws_route_table.private[*].id, [aws_route_table.database.id])

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-s3-endpoint"
    }
  )
}

#---------------------------
# DynamoDB Gateway Endpoint
#---------------------------
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = aws_route_table.private[*].id

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-dynamodb-endpoint"
    }
  )
}

# Interface endpoints (charged per AZ)

#---------------------------
# Secrets Manager Endpoint
#---------------------------
resource "aws_vpc_endpoint" "secretsmanager" {
  count = contains(var.vpc_endpoint_services, "secretsmanager") ? 1 : 0

  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-secretsmanager-endpoint"
    }
  )
}

#---------------------------
# Bedrock Runtime Endpoint
#---------------------------
resource "aws_vpc_endpoint" "bedrock_runtime" {
  count = contains(var.vpc_endpoint_services, "bedrock-runtime") ? 1 : 0

  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.bedrock-runtime"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-bedrock-runtime-endpoint"
    }
  )
}

#---------------------------
# CloudWatch Logs Endpoint
#---------------------------
resource "aws_vpc_endpoint" "cloudwatch_logs" {
  count = var.enable_vpc_endpoint_cloudwatch ? 1 : 0

  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-logs-endpoint"
    }
  )
}

#---------------------------
# KMS Endpoint
#---------------------------
resource "aws_vpc_endpoint" "kms" {
  count = contains(var.vpc_endpoint_services, "kms") ? 1 : 0

  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.kms"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-kms-endpoint"
    }
  )
}

#---------------------------
# STS Endpoint
#---------------------------
resource "aws_vpc_endpoint" "sts" {
  count = contains(var.vpc_endpoint_services, "sts") ? 1 : 0

  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.sts"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-sts-endpoint"
    }
  )
}

# Data source for current region
data "aws_region" "current" {}
