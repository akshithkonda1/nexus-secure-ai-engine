#############################
# Compute Module
# Event Sources
#############################

#---------------------------
# ALB Target Group Attachment
#---------------------------
resource "aws_lambda_permission" "alb_toron" {
  count = var.deploy_toron_lambda ? 1 : 0

  statement_id  = "AllowExecutionFromALB"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.toron[0].function_name
  principal     = "elasticloadbalancing.amazonaws.com"
  source_arn    = var.alb_target_group_arn
  qualifier     = aws_lambda_alias.toron_live[0].name
}

resource "aws_lb_target_group_attachment" "toron" {
  count = var.deploy_toron_lambda ? 1 : 0

  target_group_arn = var.alb_target_group_arn
  target_id        = var.provisioned_concurrency_toron > 0 ? aws_lambda_alias.toron_live[0].arn : aws_lambda_function.toron[0].arn
  depends_on       = [aws_lambda_permission.alb_toron]
}

#---------------------------
# S3 Event Trigger for Telemetry Processor
#---------------------------
resource "aws_lambda_permission" "s3_telemetry" {
  count = var.deploy_telemetry_lambda ? 1 : 0

  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.telemetry[0].function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.telemetry_bucket_arn
}

# S3 notification is configured in the storage module

#---------------------------
# EventBridge Rules for Scheduled Tasks
#---------------------------

# Cache warming (every 5 minutes)
resource "aws_cloudwatch_event_rule" "cache_warming" {
  count = var.deploy_toron_lambda ? 1 : 0

  name                = "${var.name_prefix}-cache-warming"
  description         = "Trigger cache warming for TORON"
  schedule_expression = "rate(5 minutes)"

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "cache_warming" {
  count = var.deploy_toron_lambda ? 1 : 0

  rule      = aws_cloudwatch_event_rule.cache_warming[0].name
  target_id = "TriggerCacheWarming"
  arn       = aws_lambda_function.toron[0].arn

  input = jsonencode({
    action = "cache_warming"
    source = "eventbridge"
  })
}

resource "aws_lambda_permission" "eventbridge_toron" {
  count = var.deploy_toron_lambda ? 1 : 0

  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.toron[0].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cache_warming[0].arn
}

# Telemetry batch processing (every hour)
resource "aws_cloudwatch_event_rule" "telemetry_batch" {
  count = var.deploy_telemetry_lambda ? 1 : 0

  name                = "${var.name_prefix}-telemetry-batch"
  description         = "Trigger batch telemetry processing"
  schedule_expression = "rate(1 hour)"

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "telemetry_batch" {
  count = var.deploy_telemetry_lambda ? 1 : 0

  rule      = aws_cloudwatch_event_rule.telemetry_batch[0].name
  target_id = "TriggerTelemetryBatch"
  arn       = aws_lambda_function.telemetry[0].arn

  input = jsonencode({
    action = "batch_process"
    source = "eventbridge"
  })
}

resource "aws_lambda_permission" "eventbridge_telemetry" {
  count = var.deploy_telemetry_lambda ? 1 : 0

  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.telemetry[0].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.telemetry_batch[0].arn
}

#---------------------------
# SQS Trigger for Failed Message Reprocessing
#---------------------------
resource "aws_sqs_queue" "reprocess" {
  name = "${var.name_prefix}-reprocess-queue"

  visibility_timeout_seconds = 300  # Match Lambda timeout
  message_retention_seconds  = 86400  # 1 day
  receive_wait_time_seconds  = 20  # Long polling

  # Encryption
  sqs_managed_sse_enabled = true

  # Dead letter queue
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.lambda_dlq.arn
    maxReceiveCount     = 3
  })

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-reprocess-queue"
    }
  )
}

resource "aws_lambda_event_source_mapping" "sqs_toron" {
  count = var.deploy_toron_lambda ? 1 : 0

  event_source_arn = aws_sqs_queue.reprocess.arn
  function_name    = aws_lambda_function.toron[0].arn
  batch_size       = 10

  function_response_types = ["ReportBatchItemFailures"]
}
