#############################
# Backup & Recovery Module
# AWS Backup, Vaults, Plans, Lifecycle
#############################

####################
# Backup Vaults
####################

# Primary backup vault
resource "aws_backup_vault" "primary" {
  name        = "${var.name_prefix}-primary-vault"
  kms_key_arn = var.kms_key_arn

  tags = merge(
    var.tags,
    {
      Name = "Primary Backup Vault"
    }
  )
}

# Lock configuration for compliance (WORM - Write Once Read Many)
resource "aws_backup_vault_lock_configuration" "primary" {
  count = var.enable_backup_lock ? 1 : 0

  backup_vault_name   = aws_backup_vault.primary.name
  min_retention_days  = var.min_retention_days
  max_retention_days  = var.max_retention_days
  changeable_for_days = 3  # Grace period before lock becomes immutable
}

# Secondary vault for cross-region backups (DR)
resource "aws_backup_vault" "secondary" {
  count = var.enable_cross_region_backup ? 1 : 0

  provider = aws.dr_region

  name        = "${var.name_prefix}-secondary-vault"
  kms_key_arn = var.dr_kms_key_arn

  tags = merge(
    var.tags,
    {
      Name   = "Secondary Backup Vault (DR)"
      Region = var.dr_region
    }
  )
}

####################
# Backup Plans
####################

# Production backup plan (daily backups, 30-day retention)
resource "aws_backup_plan" "production" {
  name = "${var.name_prefix}-production-backup-plan"

  # Daily backups at 3 AM UTC
  rule {
    rule_name         = "DailyBackup"
    target_vault_name = aws_backup_vault.primary.name
    schedule          = "cron(0 3 * * ? *)"

    start_window      = 60
    completion_window = 120

    lifecycle {
      delete_after       = 30
      cold_storage_after = 7
    }

    dynamic "copy_action" {
      for_each = var.enable_cross_region_backup ? [1] : []
      content {
        destination_vault_arn = aws_backup_vault.secondary[0].arn

        lifecycle {
          delete_after       = 30
          cold_storage_after = 7
        }
      }
    }

    recovery_point_tags = {
      BackupPlan = "Production"
      Frequency  = "Daily"
    }
  }

  # Weekly full backups (Sunday, 90-day retention)
  rule {
    rule_name         = "WeeklyBackup"
    target_vault_name = aws_backup_vault.primary.name
    schedule          = "cron(0 4 ? * SUN *)"

    start_window      = 60
    completion_window = 180

    lifecycle {
      delete_after       = 90
      cold_storage_after = 30
    }

    recovery_point_tags = {
      BackupPlan = "Production"
      Frequency  = "Weekly"
    }
  }

  # Monthly backups (1st of month, 1-year retention)
  rule {
    rule_name         = "MonthlyBackup"
    target_vault_name = aws_backup_vault.primary.name
    schedule          = "cron(0 5 1 * ? *)"

    start_window      = 60
    completion_window = 240

    lifecycle {
      delete_after       = 365
      cold_storage_after = 90
    }

    recovery_point_tags = {
      BackupPlan = "Production"
      Frequency  = "Monthly"
    }
  }

  # Compliance backups (7-year retention for government contracts)
  rule {
    rule_name         = "ComplianceBackup"
    target_vault_name = aws_backup_vault.primary.name
    schedule          = "cron(0 6 1 1 ? *)"  # January 1st yearly

    start_window      = 60
    completion_window = 300

    lifecycle {
      delete_after       = 2555  # 7 years
      cold_storage_after = 365
    }

    recovery_point_tags = {
      BackupPlan = "Production"
      Frequency  = "Yearly"
      Compliance = "7YearRetention"
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

####################
# Backup Selections
####################

# IAM role for AWS Backup
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

resource "aws_iam_role_policy_attachment" "backup_restore" {
  role       = aws_iam_role.backup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Backup selection - All production resources by tags
resource "aws_backup_selection" "production" {
  name         = "${var.name_prefix}-production-selection"
  plan_id      = aws_backup_plan.production.id
  iam_role_arn = aws_iam_role.backup.arn

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "Environment"
    value = var.environment
  }

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "Backup"
    value = "true"
  }

  resources = var.backup_resources
}

# DynamoDB-specific backup selection
resource "aws_backup_selection" "dynamodb" {
  count = length(var.dynamodb_table_arns) > 0 ? 1 : 0

  name         = "${var.name_prefix}-dynamodb-selection"
  plan_id      = aws_backup_plan.production.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = var.dynamodb_table_arns
}

# RDS-specific backup selection
resource "aws_backup_selection" "rds" {
  count = length(var.rds_cluster_arns) > 0 ? 1 : 0

  name         = "${var.name_prefix}-rds-selection"
  plan_id      = aws_backup_plan.production.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = var.rds_cluster_arns
}

# S3-specific backup selection
resource "aws_backup_selection" "s3" {
  count = length(var.s3_bucket_arns) > 0 ? 1 : 0

  name         = "${var.name_prefix}-s3-selection"
  plan_id      = aws_backup_plan.production.id
  iam_role_arn = aws_iam_role.backup.arn

  resources = var.s3_bucket_arns
}

####################
# Backup Monitoring
####################

# CloudWatch alarm for backup failures
resource "aws_cloudwatch_metric_alarm" "backup_job_failed" {
  alarm_name          = "${var.name_prefix}-backup-job-failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "NumberOfBackupJobsFailed"
  namespace           = "AWS/Backup"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Backup job failed"
  alarm_actions       = [var.critical_alarm_sns_topic_arn]

  dimensions = {
    BackupVaultName = aws_backup_vault.primary.name
  }
}

# CloudWatch alarm for restore failures
resource "aws_cloudwatch_metric_alarm" "restore_job_failed" {
  alarm_name          = "${var.name_prefix}-restore-job-failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "NumberOfRestoreJobsFailed"
  namespace           = "AWS/Backup"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Restore job failed"
  alarm_actions       = [var.critical_alarm_sns_topic_arn]

  dimensions = {
    BackupVaultName = aws_backup_vault.primary.name
  }
}

# EventBridge rule for backup job completions
resource "aws_cloudwatch_event_rule" "backup_job_completed" {
  name        = "${var.name_prefix}-backup-job-completed"
  description = "Capture backup job completions"

  event_pattern = jsonencode({
    source      = ["aws.backup"]
    detail-type = ["Backup Job State Change"]
    detail = {
      state = ["COMPLETED", "FAILED"]
    }
  })
}

resource "aws_cloudwatch_event_target" "backup_job_completed_sns" {
  rule      = aws_cloudwatch_event_rule.backup_job_completed.name
  target_id = "SendToSNS"
  arn       = var.alarm_sns_topic_arn
}

####################
# Backup Reports
####################

# AWS Backup report plan (compliance reporting)
resource "aws_backup_report_plan" "compliance" {
  name        = "${var.name_prefix}-compliance-report"
  description = "Daily backup compliance report"

  report_delivery_channel {
    s3_bucket_name = var.backup_reports_bucket_name
    s3_key_prefix  = "backup-reports/"
    formats        = ["CSV", "JSON"]
  }

  report_setting {
    report_template = "BACKUP_JOB_REPORT"

    framework_arns = [
      aws_backup_framework.compliance.arn
    ]
  }

  tags = var.tags
}

# Backup framework (compliance controls)
resource "aws_backup_framework" "compliance" {
  name        = "${var.name_prefix}-compliance-framework"
  description = "Backup compliance framework"

  # Control 1: Vault lock check
  control {
    name = "BACKUP_RESOURCES_PROTECTED_BY_BACKUP_VAULT_LOCK"

    input_parameter {
      parameter_name  = "maxRetentionDays"
      parameter_value = tostring(var.max_retention_days)
    }

    input_parameter {
      parameter_name  = "minRetentionDays"
      parameter_value = tostring(var.min_retention_days)
    }
  }

  # Control 2: Recovery point retention check
  control {
    name = "RECOVERY_POINT_MINIMUM_RETENTION_CHECK"

    input_parameter {
      parameter_name  = "requiredRetentionDays"
      parameter_value = "30"
    }
  }

  # Control 3: Backup frequency check
  control {
    name = "BACKUP_PLAN_MIN_FREQUENCY_AND_MIN_RETENTION_CHECK"

    input_parameter {
      parameter_name  = "requiredFrequencyUnit"
      parameter_value = "days"
    }

    input_parameter {
      parameter_name  = "requiredFrequencyValue"
      parameter_value = "1"
    }

    input_parameter {
      parameter_name  = "requiredRetentionDays"
      parameter_value = "30"
    }
  }

  # Control 4: Recovery point encrypted
  control {
    name = "RECOVERY_POINT_ENCRYPTED"
  }

  # Control 5: Manual deletion disabled
  control {
    name = "BACKUP_RECOVERY_POINT_MANUAL_DELETION_DISABLED"
  }

  tags = var.tags
}
