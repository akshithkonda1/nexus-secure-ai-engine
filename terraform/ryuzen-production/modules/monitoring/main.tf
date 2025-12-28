#############################
# Monitoring Module
# CloudWatch, X-Ray, CloudTrail, GuardDuty
#############################

#---------------------------
# SNS Topics for Alerts
#---------------------------
resource "aws_sns_topic" "critical_alerts" {
  name = "${var.name_prefix}-critical-alerts"

  kms_master_key_id = var.kms_key_arn

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-critical-alerts"
    }
  )
}

resource "aws_sns_topic" "alerts" {
  name = "${var.name_prefix}-alerts"

  kms_master_key_id = var.kms_key_arn

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-alerts"
    }
  )
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

resource "aws_sns_topic_subscription" "critical_email" {
  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

resource "aws_sns_topic_subscription" "critical_sms" {
  count = var.critical_alarm_phone != "" ? 1 : 0

  topic_arn = aws_sns_topic.critical_alerts.arn
  protocol  = "sms"
  endpoint  = var.critical_alarm_phone
}

#---------------------------
# CloudWatch Alarms
#---------------------------

# Lambda Error Rate
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = { for k, v in var.lambda_function_names : k => v if v != "" }

  alarm_name          = "${var.name_prefix}-${each.key}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Lambda errors exceeded threshold"
  alarm_actions       = [aws_sns_topic.critical_alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = each.value
  }

  treat_missing_data = "notBreaching"

  tags = var.tags
}

# Lambda Duration (P95 Latency)
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  for_each = { for k, v in var.lambda_function_names : k => v if v != "" && k == "toron" }

  alarm_name          = "${var.name_prefix}-${each.key}-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  threshold           = "4000"
  alarm_description   = "Lambda P95 latency exceeded 4s"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  metric_query {
    id          = "e1"
    expression  = "PERCENTILE(m1, 95)"
    label       = "P95 Duration"
    return_data = true
  }

  metric_query {
    id = "m1"
    metric {
      metric_name = "Duration"
      namespace   = "AWS/Lambda"
      period      = "300"
      stat        = "Average"
      dimensions = {
        FunctionName = each.value
      }
    }
  }

  tags = var.tags
}

# Lambda Throttles
resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  for_each = { for k, v in var.lambda_function_names : k => v if v != "" }

  alarm_name          = "${var.name_prefix}-${each.key}-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Lambda being throttled"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = each.value
  }

  treat_missing_data = "notBreaching"

  tags = var.tags
}

# ALB 5XX Errors
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  count = var.alb_arn_suffix != "" ? 1 : 0

  alarm_name          = "${var.name_prefix}-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "ALB returning high 5XX errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  treat_missing_data = "notBreaching"

  tags = var.tags
}

# RDS CPU Utilization
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  count = var.rds_cluster_identifier != "" ? 1 : 0

  alarm_name          = "${var.name_prefix}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS CPU above 80%"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBClusterIdentifier = var.rds_cluster_identifier
  }

  tags = var.tags
}

# RDS Connections
resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  count = var.rds_cluster_identifier != "" ? 1 : 0

  alarm_name          = "${var.name_prefix}-rds-high-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "800"
  alarm_description   = "RDS connections approaching limit"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBClusterIdentifier = var.rds_cluster_identifier
  }

  tags = var.tags
}

#---------------------------
# CloudTrail
#---------------------------
resource "aws_cloudtrail" "main" {
  name                          = "${var.name_prefix}-audit-trail"
  s3_bucket_name                = var.cloudtrail_bucket_name
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true
  kms_key_id                    = var.kms_key_arn

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type   = "AWS::Lambda::Function"
      values = ["arn:aws:lambda"]
    }
  }

  insight_selector {
    insight_type = "ApiCallRateInsight"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-audit-trail"
    }
  )
}

#---------------------------
# X-Ray Sampling Rule
#---------------------------
resource "aws_xray_sampling_rule" "main" {
  count = var.enable_xray_tracing ? 1 : 0

  rule_name      = "${var.name_prefix}-sampling"
  priority       = 1000
  version        = 1
  reservoir_size = 1
  fixed_rate     = var.xray_sampling_rate
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  attributes = {
    Environment = var.environment
  }
}

#---------------------------
# GuardDuty
#---------------------------
resource "aws_guardduty_detector" "main" {
  count = var.enable_guardduty ? 1 : 0

  enable                       = true
  finding_publishing_frequency = "FIFTEEN_MINUTES"

  datasources {
    s3_logs {
      enable = true
    }
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-guardduty"
    }
  )
}

#---------------------------
# Security Hub
#---------------------------
resource "aws_securityhub_account" "main" {
  count = var.enable_security_hub ? 1 : 0
}

resource "aws_securityhub_standards_subscription" "cis" {
  count = var.enable_security_hub ? 1 : 0

  standards_arn = "arn:aws:securityhub:${data.aws_region.current.name}::standards/cis-aws-foundations-benchmark/v/1.4.0"

  depends_on = [aws_securityhub_account.main]
}

resource "aws_securityhub_standards_subscription" "aws_foundational" {
  count = var.enable_security_hub ? 1 : 0

  standards_arn = "arn:aws:securityhub:${data.aws_region.current.name}::standards/aws-foundational-security-best-practices/v/1.0.0"

  depends_on = [aws_securityhub_account.main]
}

#---------------------------
# Data Sources
#---------------------------
data "aws_region" "current" {}
