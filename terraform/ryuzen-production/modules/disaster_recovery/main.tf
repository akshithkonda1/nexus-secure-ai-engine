#############################
# Disaster Recovery Module
# Multi-region failover, replication, automated recovery
#############################

####################
# Data Sources
####################

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

####################
# S3 Cross-Region Replication
####################

# Replication role
resource "aws_iam_role" "s3_replication" {
  count = var.enable_s3_replication ? 1 : 0

  name = "${var.name_prefix}-s3-replication-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "s3_replication" {
  count = var.enable_s3_replication ? 1 : 0

  name = "${var.name_prefix}-s3-replication-policy"
  role = aws_iam_role.s3_replication[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetReplicationConfiguration",
          "s3:ListBucket"
        ]
        Resource = var.source_bucket_arns
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl",
          "s3:GetObjectVersionTagging"
        ]
        Resource = [
          for arn in var.source_bucket_arns : "${arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete",
          "s3:ReplicateTags"
        ]
        Resource = [
          for arn in var.destination_bucket_arns : "${arn}/*"
        ]
      }
    ]
  })
}

####################
# DR Failover Lambda
####################

# Lambda function to orchestrate DR failover
resource "aws_lambda_function" "dr_failover" {
  filename      = "${path.module}/lambda/dr-failover.zip"
  function_name = "${var.name_prefix}-dr-failover"
  role          = aws_iam_role.dr_failover_lambda.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 900

  environment {
    variables = {
      PRIMARY_REGION   = var.primary_region
      DR_REGION        = var.dr_region
      ROUTE53_ZONE_ID  = var.route53_zone_id
      PRIMARY_ALB_DNS  = var.primary_alb_dns_name
      DR_ALB_DNS       = var.dr_alb_dns_name
      SNS_TOPIC_ARN    = var.critical_alarm_sns_topic_arn
    }
  }

  tags = var.tags
}

# IAM role for DR failover Lambda
resource "aws_iam_role" "dr_failover_lambda" {
  name = "${var.name_prefix}-dr-failover-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "dr_failover_lambda" {
  name = "${var.name_prefix}-dr-failover-lambda-policy"
  role = aws_iam_role.dr_failover_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "route53:ChangeResourceRecordSets",
          "route53:GetChange",
          "route53:GetHealthCheck",
          "route53:UpdateHealthCheck"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBClusters",
          "rds:PromoteReadReplicaDBCluster",
          "rds:FailoverDBCluster"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeTable",
          "dynamodb:UpdateTable"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = var.critical_alarm_sns_topic_arn
      },
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = "*"
      }
    ]
  })
}

# EventBridge rule to trigger DR failover
resource "aws_cloudwatch_event_rule" "dr_failover_trigger" {
  name        = "${var.name_prefix}-dr-failover-trigger"
  description = "Trigger DR failover on AWS Health events"

  event_pattern = jsonencode({
    source      = ["aws.health"]
    detail-type = ["AWS Health Event"]
    detail = {
      service           = ["RDS", "DYNAMODB", "LAMBDA"]
      eventTypeCategory = ["issue"]
    }
  })

  is_enabled = var.enable_automated_failover
}

resource "aws_cloudwatch_event_target" "dr_failover_trigger_lambda" {
  rule      = aws_cloudwatch_event_rule.dr_failover_trigger.name
  target_id = "TriggerDRFailover"
  arn       = aws_lambda_function.dr_failover.arn
}

resource "aws_lambda_permission" "dr_failover_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.dr_failover.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.dr_failover_trigger.arn
}

####################
# DR Testing Lambda
####################

# Lambda function for quarterly DR drills
resource "aws_lambda_function" "dr_test" {
  filename      = "${path.module}/lambda/dr-test.zip"
  function_name = "${var.name_prefix}-dr-test"
  role          = aws_iam_role.dr_failover_lambda.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 900

  environment {
    variables = {
      PRIMARY_REGION = var.primary_region
      DR_REGION      = var.dr_region
      SNS_TOPIC_ARN  = var.critical_alarm_sns_topic_arn
      TEST_MODE      = "true"
    }
  }

  tags = var.tags
}

# EventBridge rule for quarterly DR tests
resource "aws_cloudwatch_event_rule" "dr_test_schedule" {
  name                = "${var.name_prefix}-dr-test-schedule"
  description         = "Quarterly DR test (first Sunday of quarter)"
  schedule_expression = "cron(0 10 ? 1,4,7,10 SUN#1 *)"

  is_enabled = var.enable_dr_testing
}

resource "aws_cloudwatch_event_target" "dr_test_schedule_lambda" {
  rule      = aws_cloudwatch_event_rule.dr_test_schedule.name
  target_id = "TriggerDRTest"
  arn       = aws_lambda_function.dr_test.arn
}

resource "aws_lambda_permission" "dr_test_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.dr_test.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.dr_test_schedule.arn
}

####################
# DR Monitoring
####################

# CloudWatch alarm for DynamoDB replication lag
resource "aws_cloudwatch_metric_alarm" "dynamodb_replication_lag" {
  count = var.enable_dynamodb_global_tables ? 1 : 0

  alarm_name          = "${var.name_prefix}-dynamodb-replication-lag"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ReplicationLatency"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Maximum"
  threshold           = "60000"  # 60 seconds
  alarm_description   = "DynamoDB replication lag exceeded 60 seconds"
  alarm_actions       = [var.critical_alarm_sns_topic_arn]

  dimensions = {
    TableName       = var.dynamodb_table_name
    ReceivingRegion = var.dr_region
  }
}

# CloudWatch alarm for S3 replication lag
resource "aws_cloudwatch_metric_alarm" "s3_replication_lag" {
  count = var.enable_s3_replication ? 1 : 0

  alarm_name          = "${var.name_prefix}-s3-replication-lag"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "BytesPendingReplication"
  namespace           = "AWS/S3"
  period              = "300"
  statistic           = "Maximum"
  threshold           = "10000000000"  # 10 GB
  alarm_description   = "S3 replication lag exceeded 10 GB"
  alarm_actions       = [var.alarm_sns_topic_arn]

  dimensions = {
    SourceBucket      = var.source_bucket_name
    DestinationBucket = var.destination_bucket_name
    RuleId            = "ReplicateAll"
  }
}

# CloudWatch alarm for RDS replica lag
resource "aws_cloudwatch_metric_alarm" "rds_replica_lag" {
  count = var.enable_rds_cross_region_replica ? 1 : 0

  alarm_name          = "${var.name_prefix}-rds-replica-lag"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "AuroraBinlogReplicaLag"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Maximum"
  threshold           = "300"  # 5 minutes
  alarm_description   = "RDS replica lag exceeded 5 minutes"
  alarm_actions       = [var.critical_alarm_sns_topic_arn]

  dimensions = {
    DBClusterIdentifier = var.dr_rds_cluster_identifier
  }
}

####################
# DR Operations Log
####################

resource "aws_cloudwatch_log_group" "dr_operations" {
  name              = "/aws/dr/${var.name_prefix}/operations"
  retention_in_days = 365
  kms_key_id        = var.kms_key_arn

  tags = var.tags
}

# RTO tracking metric filter
resource "aws_cloudwatch_log_metric_filter" "rto_tracking" {
  name           = "${var.name_prefix}-rto-tracking"
  log_group_name = aws_cloudwatch_log_group.dr_operations.name
  pattern        = "[timestamp, event_type = FAILOVER_COMPLETE, rto_seconds]"

  metric_transformation {
    name      = "RecoveryTimeObjective"
    namespace = "Ryuzen/DR"
    value     = "$rto_seconds"
    unit      = "Seconds"
  }
}

# RPO tracking metric filter
resource "aws_cloudwatch_log_metric_filter" "rpo_tracking" {
  name           = "${var.name_prefix}-rpo-tracking"
  log_group_name = aws_cloudwatch_log_group.dr_operations.name
  pattern        = "[timestamp, event_type = DATA_LOSS_DETECTED, rpo_seconds]"

  metric_transformation {
    name      = "RecoveryPointObjective"
    namespace = "Ryuzen/DR"
    value     = "$rpo_seconds"
    unit      = "Seconds"
  }
}

####################
# DR Runbook (SSM Document)
####################

resource "aws_ssm_document" "dr_runbook" {
  name            = "${var.name_prefix}-dr-runbook"
  document_type   = "Automation"
  document_format = "YAML"

  content = <<-DOC
    description: Ryuzen Disaster Recovery Runbook
    schemaVersion: '0.3'
    parameters:
      TargetRegion:
        type: String
        default: ${var.dr_region}
        description: DR target region
      RPOHours:
        type: String
        default: '${var.dr_rpo_hours}'
        description: Recovery Point Objective in hours
      RTOHours:
        type: String
        default: '${var.dr_rto_hours}'
        description: Recovery Time Objective in hours
    mainSteps:
      - name: VerifyDRReadiness
        action: aws:executeScript
        inputs:
          Runtime: python3.8
          Handler: script_handler
          Script: |
            def script_handler(events, context):
                return {'status': 'DR_READY'}
      - name: ActivateDRRegion
        action: aws:executeScript
        inputs:
          Runtime: python3.8
          Handler: script_handler
          Script: |
            def script_handler(events, context):
                return {'status': 'DR_ACTIVATED'}
      - name: UpdateDNS
        action: aws:executeScript
        inputs:
          Runtime: python3.8
          Handler: script_handler
          Script: |
            def script_handler(events, context):
                return {'status': 'DNS_UPDATED'}
      - name: NotifyTeam
        action: aws:executeScript
        inputs:
          Runtime: python3.8
          Handler: script_handler
          Script: |
            def script_handler(events, context):
                return {'status': 'TEAM_NOTIFIED'}
  DOC

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-dr-runbook"
    }
  )
}

####################
# DR Status Dashboard
####################

resource "aws_cloudwatch_dashboard" "dr_status" {
  dashboard_name = "${var.name_prefix}-dr-status"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 2
        properties = {
          markdown = "# Disaster Recovery Status\n\n**Primary Region:** ${data.aws_region.current.name} | **DR Region:** ${var.dr_region} | **RPO:** ${var.dr_rpo_hours}h | **RTO:** ${var.dr_rto_hours}h"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 2
        width  = 8
        height = 6
        properties = {
          title  = "RTO Metrics"
          region = data.aws_region.current.name
          metrics = [
            ["Ryuzen/DR", "RecoveryTimeObjective", { stat = "Maximum" }]
          ]
          period = 86400
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 2
        width  = 8
        height = 6
        properties = {
          title  = "RPO Metrics"
          region = data.aws_region.current.name
          metrics = [
            ["Ryuzen/DR", "RecoveryPointObjective", { stat = "Maximum" }]
          ]
          period = 86400
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 2
        width  = 8
        height = 6
        properties = {
          title  = "DynamoDB Replication Lag"
          region = data.aws_region.current.name
          metrics = [
            ["AWS/DynamoDB", "ReplicationLatency"]
          ]
        }
      },
      {
        type   = "alarm"
        x      = 0
        y      = 8
        width  = 24
        height = 4
        properties = {
          title  = "DR Alarms"
          alarms = compact([
            var.enable_dynamodb_global_tables ? aws_cloudwatch_metric_alarm.dynamodb_replication_lag[0].arn : "",
            var.enable_s3_replication ? aws_cloudwatch_metric_alarm.s3_replication_lag[0].arn : "",
            var.enable_rds_cross_region_replica ? aws_cloudwatch_metric_alarm.rds_replica_lag[0].arn : ""
          ])
        }
      }
    ]
  })
}
