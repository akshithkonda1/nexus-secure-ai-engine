terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

variable "aws_region" {
  description = "AWS region for telemetry infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "bucket_prefix" {
  description = "Prefix used for telemetry bucket names"
  type        = string
  default     = "ryzen"
}

variable "audit_table_name" {
  description = "DynamoDB table used for telemetry audit events"
  type        = string
  default     = "TelemetryAudit"
}

variable "private_subnet_ids" {
  description = "Subnet IDs for ECS tasks with awsvpc networking"
  type        = list(string)
  default     = []
}

variable "vpc_id" {
  description = "VPC where ECS tasks will run"
  type        = string
  default     = ""
}

variable "monthly_schedule_expression" {
  description = "Cron expression controlling bundle generation cadence"
  type        = string
  default     = "cron(0 6 1 * ? *)"
}

variable "bundle_task_image" {
  description = "Container image used for bundle generation"
  type        = string
  default     = "public.ecr.aws/ryuzen/bundle-builder:latest"
}

variable "ingest_handler_package" {
  description = "Path to the ingest handler deployment artifact"
  type        = string
  default     = "artifacts/ingest_handler.zip"
}

variable "sanitize_handler_package" {
  description = "Path to the sanitize handler deployment artifact"
  type        = string
  default     = "artifacts/sanitize_handler.zip"
}

variable "analytics_handler_package" {
  description = "Path to the analytics handler deployment artifact"
  type        = string
  default     = "artifacts/analytics_handler.zip"
}

variable "delete_handler_package" {
  description = "Path to the delete_old_telemetry handler deployment artifact"
  type        = string
  default     = "artifacts/delete_old_telemetry.zip"
}

variable "sanitized_retention_days" {
  description = "Fallback retention for sanitized telemetry if cleanup Lambda does not run"
  type        = number
  default     = 30
}

variable "analytics_retention_days" {
  description = "Retention for analytics telemetry prior to partner bundle delivery"
  type        = number
  default     = 30
}

variable "partner_bundle_retention_days" {
  description = "Retention for partner bundle artifacts"
  type        = number
  default     = 90
}

resource "aws_kms_key" "telemetry" {
  description             = "KMS key for encrypting telemetry S3 buckets"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = data.aws_iam_policy_document.telemetry_kms.json
}

resource "aws_kms_alias" "telemetry" {
  name          = "alias/telemetry-storage"
  target_key_id = aws_kms_key.telemetry.key_id
}

data "aws_iam_policy_document" "telemetry_kms" {
  statement {
    sid    = "EnableRootAccess"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }

    actions   = ["kms:*"]
    resources = ["*"]
  }

  statement {
    sid    = "AllowTelemetryServices"
    effect = "Allow"

    principals {
      type = "AWS"
      identifiers = [
        aws_iam_role.ingest_lambda.arn,
        aws_iam_role.sanitize_lambda.arn,
        aws_iam_role.analytics_lambda.arn,
        aws_iam_role.delete_lambda.arn,
        aws_iam_role.bundle_task.arn,
      ]
    }

    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]

    resources = ["*"]
  }
}

resource "aws_kms_key" "dynamodb" {
  description             = "KMS key for TelemetryAudit DynamoDB table"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = data.aws_iam_policy_document.dynamodb_kms.json
}

resource "aws_kms_alias" "dynamodb" {
  name          = "alias/telemetry-audit"
  target_key_id = aws_kms_key.dynamodb.key_id
}

data "aws_iam_policy_document" "dynamodb_kms" {
  statement {
    sid    = "EnableRootAccess"
    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }

    actions   = ["kms:*"]
    resources = ["*"]
  }

  statement {
    sid    = "AllowTelemetryServices"
    effect = "Allow"

    principals {
      type = "AWS"
      identifiers = [
        aws_iam_role.ingest_lambda.arn,
        aws_iam_role.sanitize_lambda.arn,
        aws_iam_role.analytics_lambda.arn,
        aws_iam_role.delete_lambda.arn,
        aws_iam_role.bundle_task.arn,
      ]
    }

    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
    ]

    resources = ["*"]
  }
}
