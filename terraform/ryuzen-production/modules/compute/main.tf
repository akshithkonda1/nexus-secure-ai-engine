#############################
# Compute Module
# Lambda Functions
#############################

#---------------------------
# Lambda Layer (Shared Dependencies)
#---------------------------
resource "aws_lambda_layer_version" "python_dependencies" {
  layer_name          = "${var.name_prefix}-python-deps"
  description         = "Common Python dependencies for TORON"
  compatible_runtimes = [var.lambda_runtime]

  # S3 source for layer (built by CI/CD)
  s3_bucket = var.artifacts_bucket_name
  s3_key    = "layers/python-dependencies.zip"

  # Fallback to empty layer if not deployed yet
  lifecycle {
    create_before_destroy = true
  }
}

#---------------------------
# TORON Query Handler Lambda
#---------------------------
resource "aws_lambda_function" "toron" {
  count = var.deploy_toron_lambda ? 1 : 0

  function_name = "${var.name_prefix}-toron-query-handler"
  description   = "TORON epistemic AI engine query handler"
  role          = aws_iam_role.lambda_execution.arn
  runtime       = var.lambda_runtime
  handler       = "lambda_function.handler"
  timeout       = var.lambda_timeout_toron
  memory_size   = var.lambda_memory_toron

  # S3 source for function code
  s3_bucket = var.artifacts_bucket_name
  s3_key    = "functions/toron-query-handler.zip"

  # VPC configuration
  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  # Environment variables
  environment {
    variables = {
      ENVIRONMENT           = var.environment
      LOG_LEVEL             = var.environment == "production" ? "INFO" : "DEBUG"
      DYNAMODB_TIER1_TABLE  = var.dynamodb_tier1_table_name
      DYNAMODB_TIER3_TABLE  = var.dynamodb_tier3_table_name
      RDS_PROXY_ENDPOINT    = var.rds_proxy_endpoint
      SECRETS_PREFIX        = "ryuzen/"
      POWERTOOLS_SERVICE_NAME = "toron"
      POWERTOOLS_METRICS_NAMESPACE = "Ryuzen/Production"
    }
  }

  # X-Ray tracing
  tracing_config {
    mode = var.enable_xray_tracing ? "Active" : "PassThrough"
  }

  # Lambda layers
  layers = [
    aws_lambda_layer_version.python_dependencies.arn
  ]

  # Reserved concurrency (prevent runaway costs)
  reserved_concurrent_executions = var.reserved_concurrency_toron

  # Dead letter queue
  dead_letter_config {
    target_arn = aws_sqs_queue.lambda_dlq.arn
  }

  tags = merge(
    var.tags,
    {
      Name    = "${var.name_prefix}-toron-query-handler"
      Service = "TORON"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc,
    aws_cloudwatch_log_group.toron
  ]
}

#---------------------------
# Workspace API Handler Lambda
#---------------------------
resource "aws_lambda_function" "workspace" {
  count = var.deploy_workspace_lambda ? 1 : 0

  function_name = "${var.name_prefix}-workspace-api-handler"
  description   = "Ryuzen Workspace API handler"
  role          = aws_iam_role.lambda_execution.arn
  runtime       = var.lambda_runtime
  handler       = "lambda_function.handler"
  timeout       = var.lambda_timeout_workspace
  memory_size   = var.lambda_memory_workspace

  s3_bucket = var.artifacts_bucket_name
  s3_key    = "functions/workspace-api-handler.zip"

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  environment {
    variables = {
      ENVIRONMENT           = var.environment
      LOG_LEVEL             = var.environment == "production" ? "INFO" : "DEBUG"
      RDS_PROXY_ENDPOINT    = var.rds_proxy_endpoint
      SECRETS_PREFIX        = "ryuzen/"
      POWERTOOLS_SERVICE_NAME = "workspace"
    }
  }

  tracing_config {
    mode = var.enable_xray_tracing ? "Active" : "PassThrough"
  }

  layers = [
    aws_lambda_layer_version.python_dependencies.arn
  ]

  dead_letter_config {
    target_arn = aws_sqs_queue.lambda_dlq.arn
  }

  tags = merge(
    var.tags,
    {
      Name    = "${var.name_prefix}-workspace-api-handler"
      Service = "Workspace"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc,
    aws_cloudwatch_log_group.workspace
  ]
}

#---------------------------
# OAuth Handler Lambda
#---------------------------
resource "aws_lambda_function" "oauth" {
  count = var.deploy_oauth_lambda ? 1 : 0

  function_name = "${var.name_prefix}-oauth-handler"
  description   = "OAuth 2.0 flow handler"
  role          = aws_iam_role.lambda_execution.arn
  runtime       = var.lambda_runtime
  handler       = "lambda_function.handler"
  timeout       = 5
  memory_size   = 256

  s3_bucket = var.artifacts_bucket_name
  s3_key    = "functions/oauth-handler.zip"

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  environment {
    variables = {
      ENVIRONMENT        = var.environment
      RDS_PROXY_ENDPOINT = var.rds_proxy_endpoint
      SECRETS_PREFIX     = "ryuzen/"
    }
  }

  tracing_config {
    mode = var.enable_xray_tracing ? "Active" : "PassThrough"
  }

  layers = [
    aws_lambda_layer_version.python_dependencies.arn
  ]

  dead_letter_config {
    target_arn = aws_sqs_queue.lambda_dlq.arn
  }

  tags = merge(
    var.tags,
    {
      Name    = "${var.name_prefix}-oauth-handler"
      Service = "OAuth"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc,
    aws_cloudwatch_log_group.oauth
  ]
}

#---------------------------
# Telemetry Processor Lambda
#---------------------------
resource "aws_lambda_function" "telemetry" {
  count = var.deploy_telemetry_lambda ? 1 : 0

  function_name = "${var.name_prefix}-telemetry-processor"
  description   = "Batch telemetry processor for data anonymization"
  role          = aws_iam_role.lambda_execution.arn
  runtime       = var.lambda_runtime
  handler       = "lambda_function.handler"
  timeout       = 300  # 5 minutes for batch processing
  memory_size   = 2048

  s3_bucket = var.artifacts_bucket_name
  s3_key    = "functions/telemetry-processor.zip"

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  environment {
    variables = {
      ENVIRONMENT            = var.environment
      TELEMETRY_BUCKET       = var.telemetry_bucket_name
      RDS_PROXY_ENDPOINT     = var.rds_proxy_endpoint
      POWERTOOLS_SERVICE_NAME = "telemetry"
    }
  }

  tracing_config {
    mode = var.enable_xray_tracing ? "Active" : "PassThrough"
  }

  layers = [
    aws_lambda_layer_version.python_dependencies.arn
  ]

  reserved_concurrent_executions = 5  # Limit concurrent batch jobs

  dead_letter_config {
    target_arn = aws_sqs_queue.lambda_dlq.arn
  }

  tags = merge(
    var.tags,
    {
      Name    = "${var.name_prefix}-telemetry-processor"
      Service = "Telemetry"
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc,
    aws_cloudwatch_log_group.telemetry
  ]
}

#---------------------------
# Dead Letter Queue
#---------------------------
resource "aws_sqs_queue" "lambda_dlq" {
  name = "${var.name_prefix}-lambda-dlq"

  # 14 days retention for debugging
  message_retention_seconds = 1209600

  # Encryption
  sqs_managed_sse_enabled = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-lambda-dlq"
    }
  )
}

#---------------------------
# CloudWatch Log Groups
#---------------------------
resource "aws_cloudwatch_log_group" "toron" {
  count = var.deploy_toron_lambda ? 1 : 0

  name              = "/aws/lambda/${var.name_prefix}-toron-query-handler"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "workspace" {
  count = var.deploy_workspace_lambda ? 1 : 0

  name              = "/aws/lambda/${var.name_prefix}-workspace-api-handler"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "oauth" {
  count = var.deploy_oauth_lambda ? 1 : 0

  name              = "/aws/lambda/${var.name_prefix}-oauth-handler"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "telemetry" {
  count = var.deploy_telemetry_lambda ? 1 : 0

  name              = "/aws/lambda/${var.name_prefix}-telemetry-processor"
  retention_in_days = var.log_retention_days

  tags = var.tags
}
