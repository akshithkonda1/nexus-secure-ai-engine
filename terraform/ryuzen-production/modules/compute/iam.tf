#############################
# Compute Module
# IAM Roles and Policies
#############################

#---------------------------
# Lambda Execution Role
#---------------------------
resource "aws_iam_role" "lambda_execution" {
  name = "${var.name_prefix}-lambda-execution-role"

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

#---------------------------
# Basic Lambda Permissions
#---------------------------
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_xray" {
  count = var.enable_xray_tracing ? 1 : 0

  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}

#---------------------------
# Bedrock Access Policy
#---------------------------
resource "aws_iam_role_policy" "bedrock_access" {
  name = "${var.name_prefix}-bedrock-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "BedrockAccess"
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = [
          for model in var.bedrock_models :
          "arn:aws:bedrock:*::foundation-model/${model}"
        ]
      }
    ]
  })
}

#---------------------------
# DynamoDB Access Policy
#---------------------------
resource "aws_iam_role_policy" "dynamodb_access" {
  count = length(var.dynamodb_table_arns) > 0 ? 1 : 0

  name = "${var.name_prefix}-dynamodb-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DynamoDBAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = concat(
          var.dynamodb_table_arns,
          [for arn in var.dynamodb_table_arns : "${arn}/index/*"]
        )
      }
    ]
  })
}

#---------------------------
# RDS Data API Access Policy
#---------------------------
resource "aws_iam_role_policy" "rds_access" {
  count = var.rds_cluster_arn != "" ? 1 : 0

  name = "${var.name_prefix}-rds-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "RDSDataAPIAccess"
        Effect = "Allow"
        Action = [
          "rds-data:ExecuteStatement",
          "rds-data:BatchExecuteStatement",
          "rds-data:BeginTransaction",
          "rds-data:CommitTransaction",
          "rds-data:RollbackTransaction"
        ]
        Resource = var.rds_cluster_arn
      },
      {
        Sid    = "RDSProxyConnect"
        Effect = "Allow"
        Action = [
          "rds-db:connect"
        ]
        Resource = "arn:aws:rds-db:*:*:dbuser:*/ryuzen_lambda"
      }
    ]
  })
}

#---------------------------
# Secrets Manager Access Policy
#---------------------------
resource "aws_iam_role_policy" "secrets_access" {
  name = "${var.name_prefix}-secrets-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerReadOnly"
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = concat(
          var.api_secrets_arns,
          var.db_credentials_secret_arn != "" ? [var.db_credentials_secret_arn] : []
        )
      },
      {
        Sid    = "KMSDecrypt"
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = var.secrets_kms_key_arn
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.${data.aws_region.current.name}.amazonaws.com"
          }
        }
      }
    ]
  })
}

#---------------------------
# S3 Access Policy
#---------------------------
resource "aws_iam_role_policy" "s3_access" {
  name = "${var.name_prefix}-s3-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3TelemetryWrite"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl"
        ]
        Resource = "${var.telemetry_bucket_arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-server-side-encryption" = "aws:kms"
          }
        }
      },
      {
        Sid    = "S3TelemetryRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.telemetry_bucket_arn,
          "${var.telemetry_bucket_arn}/*"
        ]
      },
      {
        Sid    = "S3ArtifactsRead"
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "${var.artifacts_bucket_arn}/*"
      }
    ]
  })
}

#---------------------------
# CloudWatch Metrics Policy
#---------------------------
resource "aws_iam_role_policy" "cloudwatch_metrics" {
  name = "${var.name_prefix}-cloudwatch-metrics"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchMetrics"
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "Ryuzen/Production"
          }
        }
      }
    ]
  })
}

#---------------------------
# SQS DLQ Policy
#---------------------------
resource "aws_iam_role_policy" "sqs_dlq" {
  name = "${var.name_prefix}-sqs-dlq"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SQSDLQAccess"
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = aws_sqs_queue.lambda_dlq.arn
      }
    ]
  })
}

#---------------------------
# Data Sources
#---------------------------
data "aws_region" "current" {}
