#############################
# Database Module
# RDS Proxy (Connection Pooling)
#############################

#---------------------------
# RDS Proxy
#---------------------------
resource "aws_db_proxy" "main" {
  count = var.deploy_aurora && var.enable_rds_proxy ? 1 : 0

  name                   = "${var.name_prefix}-proxy"
  engine_family          = "POSTGRESQL"
  debug_logging          = var.environment != "production"
  idle_client_timeout    = 1800  # 30 minutes
  require_tls            = true
  role_arn               = aws_iam_role.db_proxy[0].arn
  vpc_subnet_ids         = var.private_subnet_ids
  vpc_security_group_ids = [aws_security_group.db_proxy[0].id]

  auth {
    auth_scheme               = "SECRETS"
    iam_auth                  = "REQUIRED"
    secret_arn                = var.db_credentials_secret_arn
    client_password_auth_type = "POSTGRES_SCRAM_SHA_256"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-proxy"
    }
  )

  depends_on = [aws_secretsmanager_secret_version.db_credentials]
}

#---------------------------
# RDS Proxy Default Target Group
#---------------------------
resource "aws_db_proxy_default_target_group" "main" {
  count = var.deploy_aurora && var.enable_rds_proxy ? 1 : 0

  db_proxy_name = aws_db_proxy.main[0].name

  connection_pool_config {
    max_connections_percent      = 100
    max_idle_connections_percent = 50
    connection_borrow_timeout    = 120
  }
}

#---------------------------
# RDS Proxy Target
#---------------------------
resource "aws_db_proxy_target" "main" {
  count = var.deploy_aurora && var.enable_rds_proxy ? 1 : 0

  db_proxy_name         = aws_db_proxy.main[0].name
  target_group_name     = aws_db_proxy_default_target_group.main[0].name
  db_cluster_identifier = aws_rds_cluster.main[0].id
}

#---------------------------
# RDS Proxy IAM Role
#---------------------------
resource "aws_iam_role" "db_proxy" {
  count = var.deploy_aurora && var.enable_rds_proxy ? 1 : 0

  name = "${var.name_prefix}-rds-proxy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "db_proxy" {
  count = var.deploy_aurora && var.enable_rds_proxy ? 1 : 0

  name = "${var.name_prefix}-rds-proxy-policy"
  role = aws_iam_role.db_proxy[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = var.db_credentials_secret_arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = var.kms_key_arn
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.${data.aws_region.current.name}.amazonaws.com"
          }
        }
      }
    ]
  })
}

#---------------------------
# RDS Proxy Security Group
#---------------------------
resource "aws_security_group" "db_proxy" {
  count = var.deploy_aurora && var.enable_rds_proxy ? 1 : 0

  name        = "${var.name_prefix}-rds-proxy-sg"
  description = "Security group for RDS Proxy"
  vpc_id      = var.vpc_id

  # Allow from Lambda
  ingress {
    description     = "PostgreSQL from Lambda"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.lambda_security_group_id]
  }

  # Allow to RDS
  egress {
    description     = "PostgreSQL to RDS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds[0].id]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-rds-proxy-sg"
    }
  )
}

# Add ingress rule to RDS SG for proxy
resource "aws_security_group_rule" "rds_from_proxy" {
  count = var.deploy_aurora && var.enable_rds_proxy ? 1 : 0

  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds[0].id
  source_security_group_id = aws_security_group.db_proxy[0].id
  description              = "PostgreSQL from RDS Proxy"
}

#---------------------------
# Data Sources
#---------------------------
data "aws_region" "current" {}
