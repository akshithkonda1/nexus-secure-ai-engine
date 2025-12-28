#############################
# Compliance Module
# GDPR, HIPAA, SOC2, FedRAMP
#############################

#---------------------------
# Data Classification Tags
#---------------------------
locals {
  compliance_tags = {
    SOC2    = var.enable_soc2
    GDPR    = var.enable_gdpr
    HIPAA   = var.enable_hipaa
    FedRAMP = var.enable_fedramp
  }

  enabled_frameworks = [for k, v in local.compliance_tags : k if v]
}

#---------------------------
# AWS Config Rules - SOC2
#---------------------------
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

#---------------------------
# AWS Config Rules - GDPR
#---------------------------
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

#---------------------------
# AWS Config Rules - HIPAA
#---------------------------
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

#---------------------------
# Data Retention Policy (GDPR)
#---------------------------
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

#---------------------------
# Compliance Dashboard
#---------------------------
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
      }
    ]
  })
}

#---------------------------
# Data Sources
#---------------------------
data "aws_region" "current" {}
