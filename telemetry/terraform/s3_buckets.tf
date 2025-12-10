locals {
  raw_bucket        = "${var.bucket_prefix}-raw-telemetry"
  sanitized_bucket  = "${var.bucket_prefix}-sanitized-telemetry"
  analytics_bucket  = "${var.bucket_prefix}-analytics-telemetry"
  quarantine_bucket = "${var.bucket_prefix}-telemetry-quarantine"
  partner_bucket    = "${var.bucket_prefix}-partner-bundles"
}

resource "aws_s3_bucket" "raw" {
  bucket = local.raw_bucket
}

resource "aws_s3_bucket_public_access_block" "raw" {
  bucket                  = aws_s3_bucket.raw.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "raw" {
  bucket = aws_s3_bucket.raw.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.telemetry.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "raw" {
  bucket = aws_s3_bucket.raw.id

  rule {
    id     = "ExpireRawAfterOneHour"
    status = "Enabled"

    filter {}

    expiration {
      days = 1
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

resource "aws_s3_bucket" "sanitized" {
  bucket = local.sanitized_bucket
}

resource "aws_s3_bucket_versioning" "sanitized" {
  bucket = aws_s3_bucket.sanitized.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "sanitized" {
  bucket                  = aws_s3_bucket.sanitized.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sanitized" {
  bucket = aws_s3_bucket.sanitized.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.telemetry.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "sanitized" {
  bucket = aws_s3_bucket.sanitized.id

  rule {
    id     = "CleanupByLambda"
    status = "Enabled"

    filter {}

    expiration {
      days = var.sanitized_retention_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

resource "aws_s3_bucket" "analytics" {
  bucket = local.analytics_bucket
}

resource "aws_s3_bucket_versioning" "analytics" {
  bucket = aws_s3_bucket.analytics.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "analytics" {
  bucket                  = aws_s3_bucket.analytics.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "analytics" {
  bucket = aws_s3_bucket.analytics.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.telemetry.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "analytics" {
  bucket = aws_s3_bucket.analytics.id

  rule {
    id     = "ExpireAnalyticsAfter30Days"
    status = "Enabled"

    filter {}

    expiration {
      days = var.analytics_retention_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

resource "aws_s3_bucket" "quarantine" {
  bucket = local.quarantine_bucket
}

resource "aws_s3_bucket_versioning" "quarantine" {
  bucket = aws_s3_bucket.quarantine.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "quarantine" {
  bucket                  = aws_s3_bucket.quarantine.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "quarantine" {
  bucket = aws_s3_bucket.quarantine.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.telemetry.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "quarantine" {
  bucket = aws_s3_bucket.quarantine.id

  rule {
    id     = "ExpireQuarantineAfter30Days"
    status = "Enabled"

    filter {}

    expiration {
      days = var.analytics_retention_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

resource "aws_s3_bucket" "partner" {
  bucket = local.partner_bucket
}

resource "aws_s3_bucket_versioning" "partner" {
  bucket = aws_s3_bucket.partner.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "partner" {
  bucket                  = aws_s3_bucket.partner.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "partner" {
  bucket = aws_s3_bucket.partner.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.telemetry.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "partner" {
  bucket = aws_s3_bucket.partner.id

  rule {
    id     = "ExpirePartnerBundles"
    status = "Enabled"

    filter {}

    expiration {
      days = var.partner_bundle_retention_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

output "raw_bucket_name" {
  description = "Name of the raw telemetry bucket"
  value       = aws_s3_bucket.raw.bucket
}

output "sanitized_bucket_name" {
  description = "Name of the sanitized telemetry bucket"
  value       = aws_s3_bucket.sanitized.bucket
}

output "analytics_bucket_name" {
  description = "Name of the analytics telemetry bucket"
  value       = aws_s3_bucket.analytics.bucket
}

output "quarantine_bucket_name" {
  description = "Name of the quarantine bucket"
  value       = aws_s3_bucket.quarantine.bucket
}

output "partner_bundle_bucket_name" {
  description = "Name of the partner bundle bucket"
  value       = aws_s3_bucket.partner.bucket
}
