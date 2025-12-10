resource "aws_iam_role" "ingest_lambda" {
  name               = "ryuzen-ingest-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role" "sanitize_lambda" {
  name               = "ryuzen-sanitize-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role" "analytics_lambda" {
  name               = "ryuzen-analytics-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role" "delete_lambda" {
  name               = "ryuzen-delete-telemetry-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role" "bundle_task" {
  name               = "ryuzen-bundle-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json
}

resource "aws_iam_role" "bundle_task_execution" {
  name               = "ryuzen-bundle-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "ecs_task_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "ingest_policy" {
  statement {
    sid    = "PutRawAndQuarantine"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:AbortMultipartUpload",
    ]
    resources = [
      "${aws_s3_bucket.raw.arn}/*",
      "${aws_s3_bucket.quarantine.arn}/*",
    ]
  }

  statement {
    sid    = "AuditWrites"
    effect = "Allow"
    actions = ["dynamodb:PutItem"]
    resources = [aws_dynamodb_table.telemetry_audit.arn]
  }

  statement {
    sid    = "KMSUsage"
    effect = "Allow"
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]
    resources = [aws_kms_key.telemetry.arn, aws_kms_key.dynamodb.arn]
  }

  statement {
    sid    = "WriteLogs"
    effect = "Allow"
    actions = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"]
  }
}

resource "aws_iam_policy" "ingest" {
  name   = "ryuzen-ingest-policy"
  policy = data.aws_iam_policy_document.ingest_policy.json
}

resource "aws_iam_role_policy_attachment" "ingest_attach" {
  role       = aws_iam_role.ingest_lambda.name
  policy_arn = aws_iam_policy.ingest.arn
}

data "aws_iam_policy_document" "sanitize_policy" {
  statement {
    sid    = "ReadRawAndQuarantine"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:ListBucket"
    ]
    resources = [
      aws_s3_bucket.raw.arn,
      "${aws_s3_bucket.raw.arn}/*",
      aws_s3_bucket.quarantine.arn,
      "${aws_s3_bucket.quarantine.arn}/*",
    ]
  }

  statement {
    sid    = "WriteSanitized"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:AbortMultipartUpload",
    ]
    resources = ["${aws_s3_bucket.sanitized.arn}/*"]
  }

  statement {
    sid    = "AuditWrites"
    effect = "Allow"
    actions = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.telemetry_audit.arn]
  }

  statement {
    sid    = "KMSUsage"
    effect = "Allow"
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]
    resources = [aws_kms_key.telemetry.arn, aws_kms_key.dynamodb.arn]
  }

  statement {
    sid    = "WriteLogs"
    effect = "Allow"
    actions = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"]
  }
}

resource "aws_iam_policy" "sanitize" {
  name   = "ryuzen-sanitize-policy"
  policy = data.aws_iam_policy_document.sanitize_policy.json
}

resource "aws_iam_role_policy_attachment" "sanitize_attach" {
  role       = aws_iam_role.sanitize_lambda.name
  policy_arn = aws_iam_policy.sanitize.arn
}

data "aws_iam_policy_document" "analytics_policy" {
  statement {
    sid    = "ReadSanitized"
    effect = "Allow"
    actions = ["s3:GetObject", "s3:ListBucket"]
    resources = [aws_s3_bucket.sanitized.arn, "${aws_s3_bucket.sanitized.arn}/*"]
  }

  statement {
    sid    = "WriteAnalytics"
    effect = "Allow"
    actions = ["s3:PutObject", "s3:AbortMultipartUpload"]
    resources = ["${aws_s3_bucket.analytics.arn}/*"]
  }

  statement {
    sid    = "AnalyticsQuery"
    effect = "Allow"
    actions = [
      "athena:StartQueryExecution",
      "athena:GetQueryExecution",
      "athena:GetQueryResults",
      "glue:GetDatabase",
      "glue:GetTable",
    ]
    resources = [
      "arn:aws:athena:${var.aws_region}:${data.aws_caller_identity.current.account_id}:workgroup/primary",
      "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:catalog",
      "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:database/*",
      "arn:aws:glue:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/*/*",
    ]
  }

  statement {
    sid    = "AuditWrites"
    effect = "Allow"
    actions = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.telemetry_audit.arn]
  }

  statement {
    sid    = "KMSUsage"
    effect = "Allow"
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]
    resources = [aws_kms_key.telemetry.arn, aws_kms_key.dynamodb.arn]
  }

  statement {
    sid    = "WriteLogs"
    effect = "Allow"
    actions = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"]
  }
}

resource "aws_iam_policy" "analytics" {
  name   = "ryuzen-analytics-policy"
  policy = data.aws_iam_policy_document.analytics_policy.json
}

resource "aws_iam_role_policy_attachment" "analytics_attach" {
  role       = aws_iam_role.analytics_lambda.name
  policy_arn = aws_iam_policy.analytics.arn
}

data "aws_iam_policy_document" "delete_policy" {
  statement {
    sid    = "DeleteTelemetry"
    effect = "Allow"
    actions = ["s3:DeleteObject", "s3:ListBucket"]
    resources = [
      aws_s3_bucket.raw.arn,
      "${aws_s3_bucket.raw.arn}/*",
      aws_s3_bucket.sanitized.arn,
      "${aws_s3_bucket.sanitized.arn}/*",
      aws_s3_bucket.analytics.arn,
      "${aws_s3_bucket.analytics.arn}/*",
    ]
  }

  statement {
    sid    = "AuditWrites"
    effect = "Allow"
    actions = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.telemetry_audit.arn]
  }

  statement {
    sid    = "KMSUsage"
    effect = "Allow"
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]
    resources = [aws_kms_key.telemetry.arn, aws_kms_key.dynamodb.arn]
  }

  statement {
    sid    = "WriteLogs"
    effect = "Allow"
    actions = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"]
  }
}

resource "aws_iam_policy" "delete" {
  name   = "ryuzen-delete-policy"
  policy = data.aws_iam_policy_document.delete_policy.json
}

resource "aws_iam_role_policy_attachment" "delete_attach" {
  role       = aws_iam_role.delete_lambda.name
  policy_arn = aws_iam_policy.delete.arn
}

data "aws_iam_policy_document" "bundle_task" {
  statement {
    sid    = "ReadAnalytics"
    effect = "Allow"
    actions = ["s3:GetObject", "s3:ListBucket"]
    resources = [aws_s3_bucket.analytics.arn, "${aws_s3_bucket.analytics.arn}/*"]
  }

  statement {
    sid    = "WritePartnerBundles"
    effect = "Allow"
    actions = ["s3:PutObject", "s3:AbortMultipartUpload", "s3:ListBucket"]
    resources = [aws_s3_bucket.partner.arn, "${aws_s3_bucket.partner.arn}/*"]
  }

  statement {
    sid    = "AuditWrites"
    effect = "Allow"
    actions = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.telemetry_audit.arn]
  }

  statement {
    sid    = "KMSUsage"
    effect = "Allow"
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]
    resources = [aws_kms_key.telemetry.arn, aws_kms_key.dynamodb.arn]
  }
}

resource "aws_iam_policy" "bundle_task" {
  name   = "ryuzen-bundle-task-policy"
  policy = data.aws_iam_policy_document.bundle_task.json
}

resource "aws_iam_role_policy_attachment" "bundle_task_attach" {
  role       = aws_iam_role.bundle_task.name
  policy_arn = aws_iam_policy.bundle_task.arn
}

data "aws_iam_policy_document" "bundle_task_execution" {
  statement {
    sid    = "AllowECR"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "AllowLogs"
    effect = "Allow"
    actions = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"]
  }

  statement {
    sid    = "AllowKMS"
    effect = "Allow"
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]
    resources = [aws_kms_key.telemetry.arn, aws_kms_key.dynamodb.arn]
  }
}

resource "aws_iam_policy" "bundle_task_execution" {
  name   = "ryuzen-bundle-task-execution"
  policy = data.aws_iam_policy_document.bundle_task_execution.json
}

resource "aws_iam_role_policy_attachment" "bundle_task_execution_attach" {
  role       = aws_iam_role.bundle_task_execution.name
  policy_arn = aws_iam_policy.bundle_task_execution.arn
}
