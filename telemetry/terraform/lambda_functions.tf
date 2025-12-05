resource "aws_lambda_function" "ingest" {
  function_name = "ryuzen-ingest-handler"
  role          = aws_iam_role.ingest_lambda.arn
  handler       = "ingest_handler.lambda_handler"
  runtime       = "python3.11"
  filename      = var.ingest_handler_package
  timeout       = 30
  memory_size   = 256

  environment {
    variables = {
      RAW_BUCKET       = aws_s3_bucket.raw.bucket
      SANITIZED_BUCKET = aws_s3_bucket.sanitized.bucket
      ANALYTICS_BUCKET = aws_s3_bucket.analytics.bucket
      QUARANTINE_BUCKET = aws_s3_bucket.quarantine.bucket
      AUDIT_TABLE      = aws_dynamodb_table.telemetry_audit.name
    }
  }
}

resource "aws_lambda_function" "sanitize" {
  function_name = "ryuzen-sanitize-handler"
  role          = aws_iam_role.sanitize_lambda.arn
  handler       = "sanitize_handler.lambda_handler"
  runtime       = "python3.11"
  filename      = var.sanitize_handler_package
  timeout       = 60
  memory_size   = 512

  environment {
    variables = {
      RAW_BUCKET        = aws_s3_bucket.raw.bucket
      SANITIZED_BUCKET  = aws_s3_bucket.sanitized.bucket
      ANALYTICS_BUCKET  = aws_s3_bucket.analytics.bucket
      QUARANTINE_BUCKET = aws_s3_bucket.quarantine.bucket
      AUDIT_TABLE       = aws_dynamodb_table.telemetry_audit.name
    }
  }
}

resource "aws_lambda_function" "analytics" {
  function_name = "ryuzen-analytics-handler"
  role          = aws_iam_role.analytics_lambda.arn
  handler       = "analytics_handler.lambda_handler"
  runtime       = "python3.11"
  filename      = var.analytics_handler_package
  timeout       = 120
  memory_size   = 1024

  environment {
    variables = {
      RAW_BUCKET        = aws_s3_bucket.raw.bucket
      SANITIZED_BUCKET  = aws_s3_bucket.sanitized.bucket
      ANALYTICS_BUCKET  = aws_s3_bucket.analytics.bucket
      QUARANTINE_BUCKET = aws_s3_bucket.quarantine.bucket
      AUDIT_TABLE       = aws_dynamodb_table.telemetry_audit.name
    }
  }
}

resource "aws_lambda_function" "delete_old_telemetry" {
  function_name = "ryuzen-delete-old-telemetry"
  role          = aws_iam_role.delete_lambda.arn
  handler       = "delete_old_telemetry.lambda_handler"
  runtime       = "python3.11"
  filename      = var.delete_handler_package
  timeout       = 60
  memory_size   = 256

  environment {
    variables = {
      RAW_BUCKET        = aws_s3_bucket.raw.bucket
      SANITIZED_BUCKET  = aws_s3_bucket.sanitized.bucket
      ANALYTICS_BUCKET  = aws_s3_bucket.analytics.bucket
      QUARANTINE_BUCKET = aws_s3_bucket.quarantine.bucket
      AUDIT_TABLE       = aws_dynamodb_table.telemetry_audit.name
    }
  }
}
