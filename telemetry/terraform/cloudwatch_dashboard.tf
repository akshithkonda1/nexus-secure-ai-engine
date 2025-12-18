# CloudWatch Dashboard and Alarms for Ryuzen Telemetry

# SNS Topic for alerts
resource "aws_sns_topic" "telemetry_alerts" {
  name              = "${var.bucket_prefix}-telemetry-alerts"
  display_name      = "Ryuzen Telemetry Alerts"
  kms_master_key_id = aws_kms_key.telemetry.arn
}

resource "aws_sns_topic_subscription" "telemetry_alerts_email" {
  topic_arn = aws_sns_topic.telemetry_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

variable "alert_email" {
  description = "Email address for telemetry alerts"
  type        = string
  default     = "devops@ryuzen.ai"
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "telemetry" {
  dashboard_name = "${var.bucket_prefix}-telemetry-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # Bundle Generation Metrics
      {
        type = "metric"
        properties = {
          metrics = [
            ["Ryuzen/Telemetry", "BundlesGenerated", { stat = "Sum", label = "Bundles Created" }],
            [".", "BundleRecordCount", { stat = "Average", label = "Avg Records/Bundle", yAxis = "right" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Bundle Generation"
          period  = 300
          yAxis = {
            left = {
              label = "Count"
            }
            right = {
              label = "Records"
            }
          }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["Ryuzen/Telemetry", "BundleSizeBytes", { stat = "Average", label = "Avg Bundle Size" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Bundle Size"
          period  = 300
          yAxis = {
            left = {
              label = "Bytes"
            }
          }
        }
      },

      # Privacy & Security
      {
        type = "metric"
        properties = {
          metrics = [
            ["Ryuzen/Telemetry", "PIIViolations", "Severity", "low", { stat = "Sum", color = "#2ca02c" }],
            ["...", "medium", { stat = "Sum", color = "#ff7f0e" }],
            ["...", "high", { stat = "Sum", color = "#d62728" }],
            ["...", "critical", { stat = "Sum", color = "#8B0000" }],
          ]
          view    = "timeSeries"
          stacked = true
          region  = var.aws_region
          title   = "PII Violations by Severity"
          period  = 300
          yAxis = {
            left = {
              label = "Count"
            }
          }
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["Ryuzen/Telemetry", "ScrubbingLatencyMs", "Layer", "regex", { stat = "Average" }],
            ["...", "llm", { stat = "Average" }],
            ["...", "field_filter", { stat = "Average" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Scrubbing Latency by Layer"
          period  = 300
          yAxis = {
            left = {
              label = "Milliseconds"
            }
          }
        }
      },

      # Delivery Status
      {
        type = "metric"
        properties = {
          metrics = [
            ["Ryuzen/Telemetry", "DeliverySuccess", { stat = "Sum", color = "#2ca02c" }],
            [".", "DeliveryFailure", { stat = "Sum", color = "#d62728" }],
          ]
          view    = "timeSeries"
          stacked = true
          region  = var.aws_region
          title   = "Delivery Status"
          period  = 300
          yAxis = {
            left = {
              label = "Count"
            }
          }
        }
      },

      # Lambda Errors
      {
        type = "log"
        properties = {
          query   = <<-EOT
            SOURCE '/aws/lambda/ryuzen-telemetry-ingest'
            | SOURCE '/aws/lambda/ryuzen-telemetry-sanitize'
            | SOURCE '/aws/lambda/ryuzen-telemetry-analytics'
            | fields @timestamp, @message
            | filter @message like /ERROR/
            | sort @timestamp desc
            | limit 20
          EOT
          region  = var.aws_region
          title   = "Recent Lambda Errors"
        }
      },

      # API Latency
      {
        type = "metric"
        properties = {
          metrics = [
            ["Ryuzen/Telemetry", "APILatencyMs", { stat = "Average" }],
            ["...", { stat = "p99" }],
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "API Latency (Avg & P99)"
          period  = 300
          yAxis = {
            left = {
              label = "Milliseconds"
            }
          }
        }
      },

      # Records Processed
      {
        type = "metric"
        properties = {
          metrics = [
            ["Ryuzen/Telemetry", "RecordsProcessed", "Source", "ingestion", "Status", "success", { stat = "Sum" }],
            ["...", "sanitization", ".", ".", { stat = "Sum" }],
            ["...", "analytics", ".", ".", { stat = "Sum" }],
          ]
          view    = "timeSeries"
          stacked = true
          region  = var.aws_region
          title   = "Records Processed by Source"
          period  = 300
          yAxis = {
            left = {
              label = "Count"
            }
          }
        }
      },
    ]
  })
}

# Alarms

# Alarm: PII Violations > 10 in 5 minutes
resource "aws_cloudwatch_metric_alarm" "pii_violations_high" {
  alarm_name          = "${var.bucket_prefix}-pii-violations-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "PIIViolations"
  namespace           = "Ryuzen/Telemetry"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Alert when PII violations exceed 10 in 5 minutes"
  alarm_actions       = [aws_sns_topic.telemetry_alerts.arn]
  treat_missing_data  = "notBreaching"
}

# Alarm: Any delivery failure
resource "aws_cloudwatch_metric_alarm" "delivery_failure" {
  alarm_name          = "${var.bucket_prefix}-delivery-failure"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "DeliveryFailure"
  namespace           = "Ryuzen/Telemetry"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Alert on any bundle delivery failure"
  alarm_actions       = [aws_sns_topic.telemetry_alerts.arn]
  treat_missing_data  = "notBreaching"
}

# Alarm: Lambda errors > threshold
resource "aws_cloudwatch_metric_alarm" "lambda_errors_high" {
  alarm_name          = "${var.bucket_prefix}-lambda-errors-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "LambdaErrors"
  namespace           = "Ryuzen/Telemetry"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Alert when Lambda errors exceed 5 in 2 consecutive periods"
  alarm_actions       = [aws_sns_topic.telemetry_alerts.arn]
  treat_missing_data  = "notBreaching"
}

# Alarm: High scrubbing latency
resource "aws_cloudwatch_metric_alarm" "scrubbing_latency_high" {
  alarm_name          = "${var.bucket_prefix}-scrubbing-latency-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "ScrubbingLatencyMs"
  namespace           = "Ryuzen/Telemetry"
  period              = 300
  statistic           = "Average"
  threshold           = 5000  # 5 seconds
  alarm_description   = "Alert when scrubbing latency exceeds 5 seconds"
  alarm_actions       = [aws_sns_topic.telemetry_alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    Layer = "llm"
  }
}

# Outputs
output "dashboard_url" {
  description = "CloudWatch Dashboard URL"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.telemetry.dashboard_name}"
}

output "alerts_topic_arn" {
  description = "SNS topic ARN for telemetry alerts"
  value       = aws_sns_topic.telemetry_alerts.arn
}
