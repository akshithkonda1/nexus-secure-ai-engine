#############################
# Secrets Module
# Secrets Manager & KMS
#############################

#---------------------------
# KMS Key for Encryption
#---------------------------
resource "aws_kms_key" "main" {
  description             = "KMS key for Ryuzen ${var.environment}"
  deletion_window_in_days = var.kms_key_deletion_window
  enable_key_rotation     = true
  multi_region            = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableRootAccount"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowSecretsManager"
        Effect = "Allow"
        Principal = {
          Service = "secretsmanager.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowRDS"
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowS3"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "AllowCloudWatch"
        Effect = "Allow"
        Principal = {
          Service = "logs.${data.aws_region.current.name}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-kms-key"
    }
  )
}

resource "aws_kms_alias" "main" {
  name          = "alias/${var.name_prefix}"
  target_key_id = aws_kms_key.main.key_id
}

#---------------------------
# Database Credentials Secret
#---------------------------
resource "aws_secretsmanager_secret" "db_credentials" {
  count = var.create_db_credentials ? 1 : 0

  name        = "ryuzen/${var.environment}/db-credentials"
  description = "Aurora PostgreSQL credentials"
  kms_key_id  = aws_kms_key.main.arn

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-db-credentials"
    }
  )
}

#---------------------------
# External API Secrets
#---------------------------
resource "aws_secretsmanager_secret" "api_keys" {
  for_each = toset(var.external_api_providers)

  name        = "ryuzen/${var.environment}/api-keys/${each.value}"
  description = "API key for ${each.value}"
  kms_key_id  = aws_kms_key.main.arn

  tags = merge(
    var.tags,
    {
      Name     = "${var.name_prefix}-api-key-${each.value}"
      Provider = each.value
    }
  )
}

#---------------------------
# OAuth Client Secrets
#---------------------------
resource "aws_secretsmanager_secret" "oauth_secrets" {
  name        = "ryuzen/${var.environment}/oauth-secrets"
  description = "OAuth client secrets for all providers"
  kms_key_id  = aws_kms_key.main.arn

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-oauth-secrets"
    }
  )
}

#---------------------------
# Stripe API Keys
#---------------------------
resource "aws_secretsmanager_secret" "stripe" {
  name        = "ryuzen/${var.environment}/stripe"
  description = "Stripe API keys"
  kms_key_id  = aws_kms_key.main.arn

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-stripe"
    }
  )
}

#---------------------------
# Data Sources
#---------------------------
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
