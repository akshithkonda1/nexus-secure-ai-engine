#############################
# Bedrock Module
# AI Model Configuration
#############################

# Note: AWS Bedrock model access is managed via the AWS console
# This module provides IAM policies for Lambda to invoke models

#---------------------------
# Local Variables
#---------------------------
locals {
  bedrock_model_arns = [
    for model in var.bedrock_models :
    "arn:aws:bedrock:*::foundation-model/${model}"
  ]
}

#---------------------------
# IAM Policy for Bedrock Access
#---------------------------
resource "aws_iam_policy" "bedrock_invoke" {
  name        = "${var.name_prefix}-bedrock-invoke"
  description = "Policy to invoke Bedrock models"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "InvokeModels"
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = local.bedrock_model_arns
      },
      {
        Sid    = "ListModels"
        Effect = "Allow"
        Action = [
          "bedrock:ListFoundationModels",
          "bedrock:GetFoundationModel"
        ]
        Resource = "*"
      }
    ]
  })

  tags = var.tags
}

#---------------------------
# Attach Policy to Lambda Role
#---------------------------
resource "aws_iam_role_policy_attachment" "bedrock_lambda" {
  count = var.lambda_role_arn != "" ? 1 : 0

  role       = split("/", var.lambda_role_arn)[1]
  policy_arn = aws_iam_policy.bedrock_invoke.arn
}

#---------------------------
# CloudWatch Log Group for Model Invocations
#---------------------------
resource "aws_cloudwatch_log_group" "bedrock" {
  name              = "/aws/bedrock/${var.name_prefix}"
  retention_in_days = 30

  tags = var.tags
}

#---------------------------
# CloudWatch Metric Alarm for Model Throttling
#---------------------------
resource "aws_cloudwatch_metric_alarm" "bedrock_throttling" {
  alarm_name          = "${var.name_prefix}-bedrock-throttling"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ThrottledRequests"
  namespace           = "AWS/Bedrock"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Bedrock requests being throttled"
  treat_missing_data  = "notBreaching"

  tags = var.tags
}
