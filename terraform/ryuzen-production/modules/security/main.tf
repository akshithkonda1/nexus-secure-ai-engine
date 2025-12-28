#############################
# Security Module
# WAF, Shield, GuardDuty, Security Hub, Config
#############################

####################
# AWS WAF Web ACL
####################

resource "aws_wafv2_web_acl" "main" {
  name  = "${var.name_prefix}-web-acl"
  scope = "REGIONAL"  # Use "CLOUDFRONT" for CloudFront distributions

  default_action {
    allow {}
  }

  # Rule 1: Rate limiting (prevent abuse)
  rule {
    name     = "RateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000  # 2000 requests per 5 minutes per IP
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }

  # Rule 2: Geo-blocking (sanctioned countries)
  rule {
    name     = "GeoBlockingRule"
    priority = 2

    action {
      block {}
    }

    statement {
      geo_match_statement {
        country_codes = var.blocked_countries
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "GeoBlockingRule"
      sampled_requests_enabled   = true
    }
  }

  # Rule 3: AWS Managed Rules - Core Rule Set (OWASP Top 10)
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"

        # Exclude specific rules if causing false positives
        rule_action_override {
          name = "SizeRestrictions_BODY"
          action_to_use {
            count {}
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # Rule 4: SQL Injection Protection
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 4

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesSQLiRuleSet"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesSQLiRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # Rule 5: Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 5

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesKnownBadInputsRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # Rule 6: IP Reputation List
  rule {
    name     = "AWSManagedRulesAmazonIpReputationList"
    priority = 6

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesAmazonIpReputationList"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesAmazonIpReputationList"
      sampled_requests_enabled   = true
    }
  }

  # Rule 7: Anonymous IP List (count only - some users use VPNs)
  rule {
    name     = "AWSManagedRulesAnonymousIpList"
    priority = 7

    override_action {
      count {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesAnonymousIpList"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesAnonymousIpList"
      sampled_requests_enabled   = true
    }
  }

  # Rule 8: Bot Control
  rule {
    name     = "AWSManagedRulesBotControlRuleSet"
    priority = 8

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesBotControlRuleSet"

        managed_rule_group_configs {
          aws_managed_rules_bot_control_rule_set {
            inspection_level = "COMMON"
          }
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesBotControlRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # Rule 9: Custom IP blocklist
  rule {
    name     = "CustomIPBlocklist"
    priority = 9

    action {
      block {}
    }

    statement {
      ip_set_reference_statement {
        arn = aws_wafv2_ip_set.blocklist.arn
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CustomIPBlocklist"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.name_prefix}-web-acl"
    sampled_requests_enabled   = true
  }

  tags = var.tags
}

# IP Set for custom blocklist
resource "aws_wafv2_ip_set" "blocklist" {
  name               = "${var.name_prefix}-ip-blocklist"
  scope              = "REGIONAL"
  ip_address_version = "IPV4"

  addresses = var.blocked_ips

  tags = var.tags
}

# Associate WAF with ALB
resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = var.alb_arn
  web_acl_arn  = aws_wafv2_web_acl.main.arn
}

# WAF Logging
resource "aws_wafv2_web_acl_logging_configuration" "main" {
  resource_arn = aws_wafv2_web_acl.main.arn

  log_destination_configs = [aws_kinesis_firehose_delivery_stream.waf_logs.arn]

  redacted_fields {
    single_header {
      name = "authorization"
    }
  }

  redacted_fields {
    single_header {
      name = "cookie"
    }
  }
}

# Kinesis Firehose for WAF logs → S3
resource "aws_kinesis_firehose_delivery_stream" "waf_logs" {
  name        = "aws-waf-logs-${var.name_prefix}"
  destination = "extended_s3"

  extended_s3_configuration {
    role_arn   = aws_iam_role.firehose_waf_logs.arn
    bucket_arn = var.waf_logs_bucket_arn
    prefix     = "waf-logs/"

    compression_format = "GZIP"

    cloudwatch_logging_options {
      enabled         = true
      log_group_name  = aws_cloudwatch_log_group.waf_logs.name
      log_stream_name = "S3Delivery"
    }
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "waf_logs" {
  name              = "/aws/kinesisfirehose/${var.name_prefix}-waf-logs"
  retention_in_days = 7
  kms_key_id        = var.kms_key_arn

  tags = var.tags
}

resource "aws_iam_role" "firehose_waf_logs" {
  name = "${var.name_prefix}-firehose-waf-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "firehose.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "firehose_waf_logs" {
  name = "${var.name_prefix}-firehose-waf-logs-policy"
  role = aws_iam_role.firehose_waf_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:AbortMultipartUpload",
          "s3:GetBucketLocation",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:ListBucketMultipartUploads",
          "s3:PutObject"
        ]
        Resource = [
          var.waf_logs_bucket_arn,
          "${var.waf_logs_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.waf_logs.arn}:*"
      }
    ]
  })
}

####################
# AWS GuardDuty (Threat Detection)
####################

resource "aws_guardduty_detector" "main" {
  enable                       = true
  finding_publishing_frequency = "FIFTEEN_MINUTES"

  datasources {
    s3_logs {
      enable = true
    }

    kubernetes {
      audit_logs {
        enable = false  # Not using EKS initially
      }
    }

    malware_protection {
      scan_ec2_instance_with_findings {
        ebs_volumes {
          enable = false  # Not using EC2 instances
        }
      }
    }
  }

  tags = var.tags
}

# GuardDuty findings → EventBridge → SNS
resource "aws_cloudwatch_event_rule" "guardduty_findings" {
  name        = "${var.name_prefix}-guardduty-findings"
  description = "Capture GuardDuty findings"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Finding"]
    detail = {
      severity = [7, 8, 9]  # High and critical severity only
    }
  })
}

resource "aws_cloudwatch_event_target" "guardduty_findings_sns" {
  rule      = aws_cloudwatch_event_rule.guardduty_findings.name
  target_id = "SendToSNS"
  arn       = var.security_alarm_sns_topic_arn
}

####################
# AWS Security Hub
####################

resource "aws_securityhub_account" "main" {}

# Enable security standards
resource "aws_securityhub_standards_subscription" "cis" {
  depends_on    = [aws_securityhub_account.main]
  standards_arn = "arn:aws:securityhub:${var.region}::standards/cis-aws-foundations-benchmark/v/1.4.0"
}

resource "aws_securityhub_standards_subscription" "pci_dss" {
  depends_on    = [aws_securityhub_account.main]
  standards_arn = "arn:aws:securityhub:${var.region}::standards/pci-dss/v/3.2.1"
}

resource "aws_securityhub_standards_subscription" "aws_foundational" {
  depends_on    = [aws_securityhub_account.main]
  standards_arn = "arn:aws:securityhub:${var.region}::standards/aws-foundational-security-best-practices/v/1.0.0"
}

# Security Hub findings → EventBridge → SNS
resource "aws_cloudwatch_event_rule" "security_hub_findings" {
  name        = "${var.name_prefix}-security-hub-findings"
  description = "Capture Security Hub critical findings"

  event_pattern = jsonencode({
    source      = ["aws.securityhub"]
    detail-type = ["Security Hub Findings - Imported"]
    detail = {
      findings = {
        Severity = {
          Label = ["CRITICAL", "HIGH"]
        }
        Compliance = {
          Status = ["FAILED"]
        }
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "security_hub_findings_sns" {
  rule      = aws_cloudwatch_event_rule.security_hub_findings.name
  target_id = "SendToSNS"
  arn       = var.security_alarm_sns_topic_arn
}

####################
# AWS Config (Compliance Monitoring)
####################

resource "aws_config_configuration_recorder" "main" {
  name     = "${var.name_prefix}-config-recorder"
  role_arn = aws_iam_role.config.arn

  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }
}

resource "aws_config_delivery_channel" "main" {
  name           = "${var.name_prefix}-config-delivery"
  s3_bucket_name = var.config_bucket_name

  snapshot_delivery_properties {
    delivery_frequency = "TwentyFour_Hours"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_configuration_recorder_status" "main" {
  name       = aws_config_configuration_recorder.main.name
  is_enabled = true

  depends_on = [aws_config_delivery_channel.main]
}

resource "aws_iam_role" "config" {
  name = "${var.name_prefix}-config-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "config" {
  role       = aws_iam_role.config.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWS_ConfigRole"
}

resource "aws_iam_role_policy" "config_s3" {
  name = "${var.name_prefix}-config-s3-policy"
  role = aws_iam_role.config.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetBucketVersioning",
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = [
          var.config_bucket_arn,
          "${var.config_bucket_arn}/*"
        ]
      }
    ]
  })
}

# Config Rules (compliance checks)
resource "aws_config_config_rule" "encrypted_volumes" {
  name = "${var.name_prefix}-encrypted-volumes"

  source {
    owner             = "AWS"
    source_identifier = "ENCRYPTED_VOLUMES"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "rds_encryption_enabled" {
  name = "${var.name_prefix}-rds-encryption"

  source {
    owner             = "AWS"
    source_identifier = "RDS_STORAGE_ENCRYPTED"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "s3_bucket_public_read_prohibited" {
  name = "${var.name_prefix}-s3-no-public-read"

  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_PUBLIC_READ_PROHIBITED"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "s3_bucket_public_write_prohibited" {
  name = "${var.name_prefix}-s3-no-public-write"

  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_PUBLIC_WRITE_PROHIBITED"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "iam_password_policy" {
  name = "${var.name_prefix}-iam-password-policy"

  source {
    owner             = "AWS"
    source_identifier = "IAM_PASSWORD_POLICY"
  }

  input_parameters = jsonencode({
    RequireUppercaseCharacters = "true"
    RequireLowercaseCharacters = "true"
    RequireSymbols             = "true"
    RequireNumbers             = "true"
    MinimumPasswordLength      = "14"
    PasswordReusePrevention    = "24"
    MaxPasswordAge             = "90"
  })

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "mfa_enabled_for_iam_console_access" {
  name = "${var.name_prefix}-mfa-enabled"

  source {
    owner             = "AWS"
    source_identifier = "MFA_ENABLED_FOR_IAM_CONSOLE_ACCESS"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "root_account_mfa_enabled" {
  name = "${var.name_prefix}-root-mfa"

  source {
    owner             = "AWS"
    source_identifier = "ROOT_ACCOUNT_MFA_ENABLED"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "cloudtrail_enabled" {
  name = "${var.name_prefix}-cloudtrail-enabled"

  source {
    owner             = "AWS"
    source_identifier = "CLOUD_TRAIL_ENABLED"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "vpc_flow_logs_enabled" {
  name = "${var.name_prefix}-vpc-flow-logs"

  source {
    owner             = "AWS"
    source_identifier = "VPC_FLOW_LOGS_ENABLED"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

resource "aws_config_config_rule" "lambda_inside_vpc" {
  name = "${var.name_prefix}-lambda-in-vpc"

  source {
    owner             = "AWS"
    source_identifier = "LAMBDA_INSIDE_VPC"
  }

  depends_on = [aws_config_configuration_recorder.main]
}

####################
# IAM Access Analyzer
####################

resource "aws_accessanalyzer_analyzer" "main" {
  analyzer_name = "${var.name_prefix}-access-analyzer"
  type          = "ACCOUNT"

  tags = var.tags
}

# Access Analyzer findings → EventBridge → SNS
resource "aws_cloudwatch_event_rule" "access_analyzer_findings" {
  name        = "${var.name_prefix}-access-analyzer-findings"
  description = "Capture IAM Access Analyzer findings"

  event_pattern = jsonencode({
    source      = ["aws.access-analyzer"]
    detail-type = ["Access Analyzer Finding"]
    detail = {
      status = ["ACTIVE"]
    }
  })
}

resource "aws_cloudwatch_event_target" "access_analyzer_findings_sns" {
  rule      = aws_cloudwatch_event_rule.access_analyzer_findings.name
  target_id = "SendToSNS"
  arn       = var.security_alarm_sns_topic_arn
}

####################
# AWS Macie (PII Detection in S3)
####################

resource "aws_macie2_account" "main" {
  count = var.enable_macie ? 1 : 0

  finding_publishing_frequency = "FIFTEEN_MINUTES"
  status                       = "ENABLED"
}

# Macie job to scan telemetry S3 bucket (scheduled)
resource "aws_macie2_classification_job" "telemetry_scan" {
  count = var.enable_macie ? 1 : 0

  job_type = "SCHEDULED"
  name     = "${var.name_prefix}-telemetry-pii-scan"

  s3_job_definition {
    bucket_definitions {
      account_id = var.account_id
      buckets    = [var.telemetry_bucket_name]
    }
  }

  schedule_frequency {
    weekly_schedule = "SUNDAY"
  }

  depends_on = [aws_macie2_account.main]
}

# Macie findings → EventBridge → SNS
resource "aws_cloudwatch_event_rule" "macie_findings" {
  count = var.enable_macie ? 1 : 0

  name        = "${var.name_prefix}-macie-findings"
  description = "Capture Macie PII findings"

  event_pattern = jsonencode({
    source      = ["aws.macie"]
    detail-type = ["Macie Finding"]
    detail = {
      severity = {
        description = ["High", "Critical"]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "macie_findings_sns" {
  count = var.enable_macie ? 1 : 0

  rule      = aws_cloudwatch_event_rule.macie_findings[0].name
  target_id = "SendToSNS"
  arn       = var.security_alarm_sns_topic_arn
}

####################
# AWS Inspector (Vulnerability Scanning)
####################

resource "aws_inspector2_enabler" "main" {
  account_ids    = [var.account_id]
  resource_types = ["ECR", "LAMBDA"]
}

# Inspector findings → EventBridge → SNS
resource "aws_cloudwatch_event_rule" "inspector_findings" {
  name        = "${var.name_prefix}-inspector-findings"
  description = "Capture Inspector vulnerability findings"

  event_pattern = jsonencode({
    source      = ["aws.inspector2"]
    detail-type = ["Inspector2 Finding"]
    detail = {
      severity = ["CRITICAL", "HIGH"]
    }
  })
}

resource "aws_cloudwatch_event_target" "inspector_findings_sns" {
  rule      = aws_cloudwatch_event_rule.inspector_findings.name
  target_id = "SendToSNS"
  arn       = var.security_alarm_sns_topic_arn
}

####################
# AWS Shield Advanced (Optional)
####################

resource "aws_shield_protection" "alb" {
  count = var.enable_shield_advanced ? 1 : 0

  name         = "${var.name_prefix}-alb-protection"
  resource_arn = var.alb_arn

  tags = var.tags
}

####################
# CloudWatch Alarms
####################

# WAF blocked requests alarm
resource "aws_cloudwatch_metric_alarm" "waf_high_block_rate" {
  alarm_name          = "${var.name_prefix}-waf-high-blocks"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "BlockedRequests"
  namespace           = "AWS/WAFV2"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1000"
  alarm_description   = "WAF blocking high volume of requests - possible attack"
  alarm_actions       = [var.security_alarm_sns_topic_arn]

  dimensions = {
    WebACL = aws_wafv2_web_acl.main.name
    Region = var.region
    Rule   = "ALL"
  }
}

# VPC Flow Log rejected connections
resource "aws_cloudwatch_log_metric_filter" "rejected_connections" {
  name           = "${var.name_prefix}-rejected-connections"
  pattern        = "[version, account, eni, source, destination, srcport, destport, protocol, packets, bytes, windowstart, windowend, action=\"REJECT\", flowlogstatus]"
  log_group_name = var.vpc_flow_log_group_name

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
  alarm_actions       = [var.security_alarm_sns_topic_arn]
  treat_missing_data  = "notBreaching"

  tags = var.tags
}
