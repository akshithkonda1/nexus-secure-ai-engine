#############################
# Bedrock Module
# Monitoring and Alarms
#############################

#---------------------------
# Alarm: High Guardrail Block Rate
# >50 blocks in 5 minutes = possible attack
#---------------------------
resource "aws_cloudwatch_metric_alarm" "guardrail_high_blocks" {
  alarm_name          = "${var.name_prefix}-guardrail-high-block-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "GuardrailBlocks"
  namespace           = "Ryuzen/Bedrock"
  period              = "300"
  statistic           = "Sum"
  threshold           = "50"
  alarm_description   = "High guardrail block rate - possible attack or misconfiguration"
  alarm_actions       = var.critical_alerts_sns_arn != "" ? [var.critical_alerts_sns_arn] : []
  ok_actions          = var.alerts_sns_topic_arn != "" ? [var.alerts_sns_topic_arn] : []
  treat_missing_data  = "notBreaching"

  tags = merge(
    var.tags,
    {
      Name     = "${var.name_prefix}-guardrail-high-blocks"
      Severity = "critical"
    }
  )
}

#---------------------------
# Alarm: Emergency Detected
#---------------------------
resource "aws_cloudwatch_metric_alarm" "emergency_detected" {
  alarm_name          = "${var.name_prefix}-emergency-detected"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EmergencyDetected"
  namespace           = "Ryuzen/Bedrock"
  period              = "60"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Medical emergency keyword detected in user query"
  alarm_actions       = var.alerts_sns_topic_arn != "" ? [var.alerts_sns_topic_arn] : []
  treat_missing_data  = "notBreaching"

  tags = merge(
    var.tags,
    {
      Name     = "${var.name_prefix}-emergency-detected"
      Severity = "info"
    }
  )
}

#---------------------------
# Alarm: Prompt Attack Attempts
#---------------------------
resource "aws_cloudwatch_metric_alarm" "prompt_attack_attempts" {
  alarm_name          = "${var.name_prefix}-prompt-attack-attempts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "GuardrailBlocksPromptAttack"
  namespace           = "Ryuzen/Bedrock"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Multiple prompt injection attempts detected"
  alarm_actions       = var.critical_alerts_sns_arn != "" ? [var.critical_alerts_sns_arn] : []
  treat_missing_data  = "notBreaching"

  tags = merge(
    var.tags,
    {
      Name     = "${var.name_prefix}-prompt-attacks"
      Severity = "critical"
    }
  )
}

#---------------------------
# Alarm: High PII Detection Rate
#---------------------------
resource "aws_cloudwatch_metric_alarm" "high_pii_detection" {
  alarm_name          = "${var.name_prefix}-high-pii-detection"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "GuardrailBlocksPII"
  namespace           = "Ryuzen/Bedrock"
  period              = "300"
  statistic           = "Sum"
  threshold           = "20"
  alarm_description   = "High rate of PII detected in requests"
  alarm_actions       = var.alerts_sns_topic_arn != "" ? [var.alerts_sns_topic_arn] : []
  treat_missing_data  = "notBreaching"

  tags = merge(
    var.tags,
    {
      Name     = "${var.name_prefix}-high-pii"
      Severity = "warning"
    }
  )
}

#---------------------------
# Alarm: High Tier 4 Usage
# >5 Tier 4 invocations/hour = possible issue with Tier 1 consensus
#---------------------------
resource "aws_cloudwatch_metric_alarm" "high_tier4_usage" {
  alarm_name          = "${var.name_prefix}-high-tier4-usage"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Tier4Invocations"
  namespace           = "Ryuzen/Bedrock"
  period              = "3600"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "High Tier 4 (arbiter) usage - check Tier 1 consensus quality"
  alarm_actions       = var.alerts_sns_topic_arn != "" ? [var.alerts_sns_topic_arn] : []
  treat_missing_data  = "notBreaching"

  tags = merge(
    var.tags,
    {
      Name     = "${var.name_prefix}-high-tier4"
      Severity = "warning"
    }
  )
}

#---------------------------
# Alarm: High Model Disagreement
#---------------------------
resource "aws_cloudwatch_metric_alarm" "high_model_disagreement" {
  alarm_name          = "${var.name_prefix}-high-model-disagreement"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ModelDisagreement"
  namespace           = "Ryuzen/Bedrock"
  period              = "3600"
  statistic           = "Average"
  threshold           = "0.25"
  alarm_description   = "High rate of model disagreement - check prompt quality"
  alarm_actions       = var.alerts_sns_topic_arn != "" ? [var.alerts_sns_topic_arn] : []
  treat_missing_data  = "notBreaching"

  tags = merge(
    var.tags,
    {
      Name     = "${var.name_prefix}-high-disagreement"
      Severity = "info"
    }
  )
}

#---------------------------
# CloudWatch Dashboard
#---------------------------
resource "aws_cloudwatch_dashboard" "guardrails" {
  dashboard_name = "${var.name_prefix}-guardrails"

  dashboard_body = jsonencode({
    widgets = [
      # Header
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# TORON Guardrails & Epistemic Honesty Dashboard"
        }
      },

      # Guardrail Blocks (Overview)
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 8
        height = 6
        properties = {
          title   = "Guardrail Blocks (5 min)"
          region  = data.aws_region.current.name
          metrics = [
            ["Ryuzen/Bedrock", "GuardrailBlocks", { "stat": "Sum", "period": 300 }]
          ]
          view = "timeSeries"
        }
      },

      # Blocks by Reason
      {
        type   = "metric"
        x      = 8
        y      = 1
        width  = 8
        height = 6
        properties = {
          title   = "Blocks by Reason"
          region  = data.aws_region.current.name
          metrics = [
            ["Ryuzen/Bedrock", "GuardrailBlocksContent", { "stat": "Sum", "period": 3600 }],
            [".", "GuardrailBlocksTopic", { "stat": "Sum", "period": 3600 }],
            [".", "GuardrailBlocksWord", { "stat": "Sum", "period": 3600 }],
            [".", "GuardrailBlocksPII", { "stat": "Sum", "period": 3600 }],
            [".", "GuardrailBlocksPromptAttack", { "stat": "Sum", "period": 3600 }]
          ]
          view = "bar"
        }
      },

      # Emergency Detections
      {
        type   = "metric"
        x      = 16
        y      = 1
        width  = 8
        height = 6
        properties = {
          title   = "Emergency Detections"
          region  = data.aws_region.current.name
          metrics = [
            ["Ryuzen/Bedrock", "EmergencyDetected", { "stat": "Sum", "period": 3600, "color": "#d62728" }]
          ]
          view      = "timeSeries"
          yAxis     = { "left": { "min": 0 } }
          annotations = {
            horizontal = [
              { "value": 1, "label": "Emergency", "color": "#d62728" }
            ]
          }
        }
      },

      # Disclaimers by Domain
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          title   = "Disclaimers by Domain (1 hour)"
          region  = data.aws_region.current.name
          metrics = [
            ["Ryuzen/Bedrock", "DisclaimersMedical", { "stat": "Sum", "period": 3600, "color": "#2ca02c" }],
            [".", "DisclaimersFinancial", { "stat": "Sum", "period": 3600, "color": "#1f77b4" }],
            [".", "DisclaimersLegal", { "stat": "Sum", "period": 3600, "color": "#ff7f0e" }]
          ]
          view = "pie"
        }
      },

      # Model Disagreement & Tier 4
      {
        type   = "metric"
        x      = 12
        y      = 7
        width  = 12
        height = 6
        properties = {
          title   = "Epistemic Quality"
          region  = data.aws_region.current.name
          metrics = [
            ["Ryuzen/Bedrock", "ModelDisagreement", { "stat": "Sum", "period": 3600, "label": "Low Agreement (<75%)" }],
            [".", "Tier4Invocations", { "stat": "Sum", "period": 3600, "label": "Tier 4 Arbiter Used" }]
          ]
          view = "timeSeries"
          yAxis = { "left": { "min": 0 } }
        }
      },

      # Block Rate Percentage
      {
        type   = "metric"
        x      = 0
        y      = 13
        width  = 12
        height = 4
        properties = {
          title   = "Block Rate Health"
          region  = data.aws_region.current.name
          metrics = [
            ["Ryuzen/Bedrock", "GuardrailBlocks", { "stat": "Sum", "period": 3600 }]
          ]
          view = "singleValue"
          annotations = {
            horizontal = [
              { "value": 50, "label": "Alert Threshold", "color": "#d62728" }
            ]
          }
        }
      },

      # Recent Blocks Log
      {
        type   = "log"
        x      = 12
        y      = 13
        width  = 12
        height = 4
        properties = {
          title  = "Recent Guardrail Blocks"
          region = data.aws_region.current.name
          query  = "SOURCE '/aws/bedrock/${var.name_prefix}/guardrail-blocks'\n| fields @timestamp, blockReason, @message\n| filter action = \"BLOCKED\"\n| sort @timestamp desc\n| limit 20"
        }
      }
    ]
  })
}

#---------------------------
# Data Sources
#---------------------------
data "aws_region" "current" {}
