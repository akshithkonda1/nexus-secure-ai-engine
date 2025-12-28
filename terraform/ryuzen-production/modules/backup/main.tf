#############################
# Backup Module
# AWS Backup
#############################

#---------------------------
# Backup Vault
#---------------------------
resource "aws_backup_vault" "main" {
  name        = "${var.name_prefix}-backup-vault"
  kms_key_arn = var.kms_key_arn

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-backup-vault"
    }
  )
}

#---------------------------
# Backup Plan - Daily
#---------------------------
resource "aws_backup_plan" "daily" {
  name = "${var.name_prefix}-daily-backup"

  rule {
    rule_name         = "daily-backup-rule"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 3 * * ? *)"  # Daily at 3 AM UTC

    lifecycle {
      cold_storage_after = 30
      delete_after       = var.backup_retention_days
    }

    copy_action {
      destination_vault_arn = aws_backup_vault.main.arn

      lifecycle {
        delete_after = var.backup_retention_days
      }
    }
  }

  rule {
    rule_name         = "weekly-backup-rule"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 3 ? * SUN *)"  # Weekly on Sunday

    lifecycle {
      cold_storage_after = 90
      delete_after       = var.backup_retention_days
    }
  }

  advanced_backup_setting {
    backup_options = {
      WindowsVSS = "disabled"
    }
    resource_type = "RDS"
  }

  tags = var.tags
}

#---------------------------
# IAM Role for Backup
#---------------------------
resource "aws_iam_role" "backup" {
  name = "${var.name_prefix}-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "backup" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_iam_role_policy_attachment" "restore" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

#---------------------------
# Backup Selection - RDS
#---------------------------
resource "aws_backup_selection" "rds" {
  count = var.rds_cluster_arn != "" ? 1 : 0

  name         = "${var.name_prefix}-rds-backup"
  plan_id      = aws_backup_plan.daily.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = [var.rds_cluster_arn]
}

#---------------------------
# Backup Selection - DynamoDB
#---------------------------
resource "aws_backup_selection" "dynamodb" {
  count = length(var.dynamodb_table_arns) > 0 ? 1 : 0

  name         = "${var.name_prefix}-dynamodb-backup"
  plan_id      = aws_backup_plan.daily.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = var.dynamodb_table_arns
}

#---------------------------
# Backup Selection - S3
#---------------------------
resource "aws_backup_selection" "s3" {
  count = length(var.s3_bucket_arns) > 0 ? 1 : 0

  name         = "${var.name_prefix}-s3-backup"
  plan_id      = aws_backup_plan.daily.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = var.s3_bucket_arns
}
