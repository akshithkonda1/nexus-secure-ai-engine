#############################
# Security Module
# WAF, Shield, Security Controls
#############################

# Note: WAF Web ACL is created in the networking module
# This module provides additional security controls

#---------------------------
# IAM Access Analyzer
#---------------------------
resource "aws_accessanalyzer_analyzer" "main" {
  analyzer_name = "${var.name_prefix}-analyzer"
  type          = "ACCOUNT"

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-analyzer"
    }
  )
}

#---------------------------
# AWS Shield Advanced (Optional)
#---------------------------
resource "aws_shield_protection" "alb" {
  count = var.enable_shield_advanced ? 1 : 0

  name         = "${var.name_prefix}-alb-protection"
  resource_arn = var.alb_arn

  tags = var.tags
}

#---------------------------
# VPC Flow Log Analysis
#---------------------------
resource "aws_cloudwatch_log_metric_filter" "rejected_connections" {
  name           = "${var.name_prefix}-rejected-connections"
  pattern        = "[version, account, eni, source, destination, srcport, destport, protocol, packets, bytes, windowstart, windowend, action=\"REJECT\", flowlogstatus]"
  log_group_name = "/aws/vpc/${var.name_prefix}-vpc/flow-logs"

  metric_transformation {
    name      = "RejectedConnections"
    namespace = "Ryuzen/Security"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_rejected_connections" {
  alarm_name          = "${var.name_prefix}-high-rejected-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "RejectedConnections"
  namespace           = "Ryuzen/Security"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1000"
  alarm_description   = "High number of rejected connections - potential attack"
  treat_missing_data  = "notBreaching"

  tags = var.tags
}

#---------------------------
# Security Group Rules Audit
#---------------------------
resource "aws_config_config_rule" "security_group_open" {
  count = var.enable_waf ? 1 : 0

  name = "${var.name_prefix}-restricted-ssh"

  source {
    owner             = "AWS"
    source_identifier = "INCOMING_SSH_DISABLED"
  }

  tags = var.tags
}

resource "aws_config_config_rule" "security_group_rdp" {
  count = var.enable_waf ? 1 : 0

  name = "${var.name_prefix}-restricted-rdp"

  source {
    owner             = "AWS"
    source_identifier = "RESTRICTED_INCOMING_TRAFFIC"
  }

  input_parameters = jsonencode({
    blockedPort1 = "3389"
  })

  tags = var.tags
}

#---------------------------
# Encryption Compliance Rules
#---------------------------
resource "aws_config_config_rule" "s3_bucket_encryption" {
  count = var.enable_waf ? 1 : 0

  name = "${var.name_prefix}-s3-encryption"

  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED"
  }

  tags = var.tags
}

resource "aws_config_config_rule" "rds_encryption" {
  count = var.enable_waf ? 1 : 0

  name = "${var.name_prefix}-rds-encryption"

  source {
    owner             = "AWS"
    source_identifier = "RDS_STORAGE_ENCRYPTED"
  }

  tags = var.tags
}
