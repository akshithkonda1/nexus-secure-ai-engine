#############################
# Compliance Module
# GDPR, HIPAA, SOC2, FedRAMP controls
#############################

####################
# Data Sources
####################

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

####################
# Data Classification Tags
####################

locals {
  compliance_tags = {
    SOC2    = var.enable_soc2
    GDPR    = var.enable_gdpr
    HIPAA   = var.enable_hipaa
    FedRAMP = var.enable_fedramp
  }

  enabled_frameworks = [for k, v in local.compliance_tags : k if v]

  data_classifications = {
    public = {
      encryption_required     = false
      mfa_required            = false
      audit_logging_required  = false
      retention_days          = 90
    }

    internal = {
      encryption_required     = true
      mfa_required            = false
      audit_logging_required  = true
      retention_days          = 365
    }

    confidential = {
      encryption_required     = true
      mfa_required            = true
      audit_logging_required  = true
      retention_days          = 2555
    }

    restricted = {
      encryption_required     = true
      mfa_required            = true
      audit_logging_required  = true
      retention_days          = 2555
      requires_approval       = true
    }
  }
}

####################
# GDPR Controls
####################

# S3 lifecycle policy for GDPR data retention (90 days)
resource "aws_s3_bucket_lifecycle_configuration" "gdpr_retention" {
  count  = var.enable_gdpr && var.telemetry_bucket_name != "" ? 1 : 0
  bucket = var.telemetry_bucket_name

  rule {
    id     = "gdpr-90-day-retention"
    status = "Enabled"

    expiration {
      days = 90
    }

    transition {
      days          = 30
      storage_class = "GLACIER_IR"
    }

    filter {
      tag {
        key   = "DataClassification"
        value = "PersonalData"
      }
    }
  }

  rule {
    id     = "gdpr-anonymized-data-retention"
    status = "Enabled"

    expiration {
      days = 2555
    }

    transition {
      days          = 90
      storage_class = "GLACIER_IR"
    }

    filter {
      tag {
        key   = "DataClassification"
        value = "AnonymizedData"
      }
    }
  }
}

# Lambda function for GDPR "right to erasure" requests
resource "aws_lambda_function" "gdpr_erasure" {
  count = var.enable_gdpr ? 1 : 0

  filename      = "${path.module}/lambda/gdpr-erasure.zip"
  function_name = "${var.name_prefix}-gdpr-erasure"
  role          = aws_iam_role.gdpr_erasure_lambda[0].arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300

  environment {
    variables = {
      DYNAMODB_TABLES  = jsonencode(var.dynamodb_table_names)
      RDS_CLUSTER_ARN  = var.rds_cluster_arn
      S3_BUCKETS       = jsonencode(var.s3_bucket_names)
      AUDIT_LOG_TABLE  = var.audit_log_table_name
    }
  }

  tags = merge(
    var.tags,
    {
      Compliance = "GDPR"
      Purpose    = "RightToErasure"
    }
  )
}

resource "aws_iam_role" "gdpr_erasure_lambda" {
  count = var.enable_gdpr ? 1 : 0

  name = "${var.name_prefix}-gdpr-erasure-lambda-role"

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

resource "aws_iam_role_policy" "gdpr_erasure_lambda" {
  count = var.enable_gdpr ? 1 : 0

  name = "${var.name_prefix}-gdpr-erasure-lambda-policy"
  role = aws_iam_role.gdpr_erasure_lambda[0].id

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
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = var.dynamodb_table_arns
      },
      {
        Effect = "Allow"
        Action = [
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = flatten([
          for bucket in var.s3_bucket_arns : [bucket, "${bucket}/*"]
        ])
      }
    ]
  })
}

# DynamoDB table for GDPR consent records
resource "aws_dynamodb_table" "gdpr_consent" {
  count = var.enable_gdpr ? 1 : 0

  name         = "${var.name_prefix}-gdpr-consent"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"
  range_key    = "consent_timestamp"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "consent_timestamp"
    type = "N"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  tags = merge(
    var.tags,
    {
      DataClassification = "Confidential"
      Compliance         = "GDPR"
      PII                = "true"
    }
  )
}

####################
# HIPAA Controls
####################

# CloudTrail for HIPAA audit logging (immutable, encrypted)
resource "aws_cloudtrail" "hipaa_audit" {
  count = var.enable_hipaa ? 1 : 0

  name                          = "${var.name_prefix}-hipaa-audit-trail"
  s3_bucket_name                = var.cloudtrail_bucket_name
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type   = "AWS::S3::Object"
      values = var.medical_data_bucket_arn != "" ? ["${var.medical_data_bucket_arn}/"] : []
    }

    data_resource {
      type   = "AWS::Lambda::Function"
      values = ["arn:aws:lambda"]
    }

    data_resource {
      type   = "AWS::DynamoDB::Table"
      values = var.dynamodb_table_arns
    }
  }

  cloud_watch_logs_group_arn = "${aws_cloudwatch_log_group.hipaa_audit[0].arn}:*"
  cloud_watch_logs_role_arn  = aws_iam_role.cloudtrail_cloudwatch[0].arn

  kms_key_id = var.kms_key_arn

  tags = merge(
    var.tags,
    {
      Compliance = "HIPAA"
      Immutable  = "true"
    }
  )
}

resource "aws_cloudwatch_log_group" "hipaa_audit" {
  count = var.enable_hipaa ? 1 : 0

  name              = "/aws/cloudtrail/${var.name_prefix}/hipaa-audit"
  retention_in_days = 2555  # 7 years
  kms_key_id        = var.kms_key_arn

  tags = merge(
    var.tags,
    {
      Compliance = "HIPAA"
    }
  )
}

resource "aws_iam_role" "cloudtrail_cloudwatch" {
  count = var.enable_hipaa ? 1 : 0

  name = "${var.name_prefix}-cloudtrail-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "cloudtrail_cloudwatch" {
  count = var.enable_hipaa ? 1 : 0

  name = "${var.name_prefix}-cloudtrail-cloudwatch-policy"
  role = aws_iam_role.cloudtrail_cloudwatch[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.hipaa_audit[0].arn}:*"
      }
    ]
  })
}

####################
# SOC2 Controls
####################

# IAM password policy (SOC2 requirement)
resource "aws_iam_account_password_policy" "soc2" {
  count = var.enable_soc2 ? 1 : 0

  minimum_password_length        = 14
  require_lowercase_characters   = true
  require_numbers                = true
  require_uppercase_characters   = true
  require_symbols                = true
  allow_users_to_change_password = true
  max_password_age               = 90
  password_reuse_prevention      = 24
  hard_expiry                    = false
}

# S3 bucket for SOC2 audit evidence
resource "aws_s3_bucket" "soc2_evidence" {
  count = var.enable_soc2 ? 1 : 0

  bucket = "${var.name_prefix}-soc2-evidence-${var.account_id}"

  tags = merge(
    var.tags,
    {
      Compliance = "SOC2"
      Purpose    = "AuditEvidence"
    }
  )
}

resource "aws_s3_bucket_versioning" "soc2_evidence" {
  count  = var.enable_soc2 ? 1 : 0
  bucket = aws_s3_bucket.soc2_evidence[0].id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "soc2_evidence" {
  count  = var.enable_soc2 ? 1 : 0
  bucket = aws_s3_bucket.soc2_evidence[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "soc2_evidence" {
  count  = var.enable_soc2 ? 1 : 0
  bucket = aws_s3_bucket.soc2_evidence[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

####################
# Compliance Reporting
####################

# Lambda function to generate compliance reports
resource "aws_lambda_function" "compliance_report" {
  filename      = "${path.module}/lambda/compliance-report.zip"
  function_name = "${var.name_prefix}-compliance-report"
  role          = aws_iam_role.compliance_report_lambda.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 900

  environment {
    variables = {
      COMPLIANCE_FRAMEWORKS = jsonencode(local.enabled_frameworks)
      REPORT_BUCKET         = var.enable_soc2 ? aws_s3_bucket.soc2_evidence[0].id : ""
      SNS_TOPIC_ARN         = var.compliance_report_sns_topic_arn
    }
  }

  tags = var.tags
}

resource "aws_iam_role" "compliance_report_lambda" {
  name = "${var.name_prefix}-compliance-report-lambda-role"

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

resource "aws_iam_role_policy" "compliance_report_lambda" {
  name = "${var.name_prefix}-compliance-report-lambda-policy"
  role = aws_iam_role.compliance_report_lambda.id

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
          "config:DescribeComplianceByConfigRule",
          "config:DescribeConfigRules",
          "securityhub:GetFindings",
          "guardduty:ListFindings",
          "macie2:ListFindings"
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject"]
        Resource = var.enable_soc2 ? "${aws_s3_bucket.soc2_evidence[0].arn}/*" : "*"
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = var.compliance_report_sns_topic_arn
      }
    ]
  })
}

# EventBridge rule for monthly compliance reports
resource "aws_cloudwatch_event_rule" "compliance_report_schedule" {
  name                = "${var.name_prefix}-compliance-report-schedule"
  description         = "Generate monthly compliance report"
  schedule_expression = "cron(0 9 1 * ? *)"  # 9 AM UTC on 1st of month
}

resource "aws_cloudwatch_event_target" "compliance_report_schedule_lambda" {
  rule      = aws_cloudwatch_event_rule.compliance_report_schedule.name
  target_id = "TriggerComplianceReport"
  arn       = aws_lambda_function.compliance_report.arn
}

resource "aws_lambda_permission" "compliance_report_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.compliance_report.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.compliance_report_schedule.arn
}

####################
# Config Rules
####################

# SOC2 Config Rules
resource "aws_config_config_rule" "cloudtrail_enabled" {
  count = var.enable_soc2 ? 1 : 0

  name = "${var.name_prefix}-cloudtrail-enabled"

  source {
    owner             = "AWS"
    source_identifier = "CLOUD_TRAIL_ENABLED"
  }

  tags = var.tags
}

resource "aws_config_config_rule" "iam_password_policy" {
  count = var.enable_soc2 ? 1 : 0

  name = "${var.name_prefix}-iam-password-policy"

  source {
    owner             = "AWS"
    source_identifier = "IAM_PASSWORD_POLICY"
  }

  input_parameters = jsonencode({
    RequireUppercaseCharacters = "true"
    RequireLowercaseCharacters = "true"
    RequireSymbols             = "true"
    RequireNumbers             = "true"
    MinimumPasswordLength      = "14"
    PasswordReusePrevention    = "24"
    MaxPasswordAge             = "90"
  })

  tags = var.tags
}

resource "aws_config_config_rule" "mfa_enabled" {
  count = var.enable_soc2 ? 1 : 0

  name = "${var.name_prefix}-root-mfa-enabled"

  source {
    owner             = "AWS"
    source_identifier = "ROOT_ACCOUNT_MFA_ENABLED"
  }

  tags = var.tags
}

# GDPR Config Rules
resource "aws_config_config_rule" "s3_bucket_logging" {
  count = var.enable_gdpr ? 1 : 0

  name = "${var.name_prefix}-s3-logging-enabled"

  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_LOGGING_ENABLED"
  }

  tags = var.tags
}

resource "aws_config_config_rule" "kms_key_rotation" {
  count = var.enable_gdpr ? 1 : 0

  name = "${var.name_prefix}-kms-rotation-enabled"

  source {
    owner             = "AWS"
    source_identifier = "CMK_BACKING_KEY_ROTATION_ENABLED"
  }

  tags = var.tags
}

# HIPAA Config Rules
resource "aws_config_config_rule" "rds_logging" {
  count = var.enable_hipaa ? 1 : 0

  name = "${var.name_prefix}-rds-logging-enabled"

  source {
    owner             = "AWS"
    source_identifier = "RDS_LOGGING_ENABLED"
  }

  tags = var.tags
}

resource "aws_config_config_rule" "vpc_flow_logs" {
  count = var.enable_hipaa ? 1 : 0

  name = "${var.name_prefix}-vpc-flow-logs-enabled"

  source {
    owner             = "AWS"
    source_identifier = "VPC_FLOW_LOGS_ENABLED"
  }

  tags = var.tags
}

####################
# Data Retention Policy
####################

resource "aws_ssm_parameter" "data_retention_policy" {
  name        = "/${var.name_prefix}/compliance/data-retention-days"
  description = "GDPR-compliant data retention period"
  type        = "String"
  value       = tostring(var.telemetry_retention_days)

  tags = merge(
    var.tags,
    {
      Compliance = "GDPR"
    }
  )
}

####################
# Compliance Dashboard
####################

resource "aws_cloudwatch_dashboard" "compliance" {
  dashboard_name = "${var.name_prefix}-compliance"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 2
        properties = {
          markdown = "# Compliance Status Dashboard\n\n**Enabled Frameworks:** ${join(", ", local.enabled_frameworks)}"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 2
        width  = 12
        height = 6
        properties = {
          title   = "Config Rule Compliance"
          region  = data.aws_region.current.name
          view    = "bar"
          metrics = [
            ["AWS/Config", "CompliancePercentage"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 2
        width  = 12
        height = 6
        properties = {
          title   = "Security Hub Findings"
          region  = data.aws_region.current.name
          metrics = [
            ["AWS/SecurityHub", "ActiveFindings"]
          ]
        }
      }
    ]
  })
}
