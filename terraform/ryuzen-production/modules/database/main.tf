#############################
# Database Module
# DynamoDB Tables
#############################

#---------------------------
# Tier 1 Cache Table (Consensus Results)
#---------------------------
resource "aws_dynamodb_table" "tier1_cache" {
  count = var.deploy_dynamodb ? 1 : 0

  name         = "${var.name_prefix}-tier1-cache"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "prompt_hash"

  attribute {
    name = "prompt_hash"
    type = "S"  # SHA-256 hash of prompt
  }

  attribute {
    name = "created_at"
    type = "N"  # Unix timestamp
  }

  # TTL for automatic expiration
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  # Point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Encryption with customer-managed KMS key
  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  # Global Secondary Index for time-based queries
  global_secondary_index {
    name            = "created_at-index"
    hash_key        = "created_at"
    projection_type = "ALL"
  }

  # Stream for change data capture
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # Global table replica (when enabled)
  dynamic "replica" {
    for_each = var.enable_dynamodb_global_tables ? [var.dr_region] : []
    content {
      region_name = replica.value
    }
  }

  tags = merge(
    var.tags,
    {
      Name      = "${var.name_prefix}-tier1-cache"
      DataClass = "Cache"
      Service   = "TORON"
    }
  )
}

#---------------------------
# Tier 3 Cache Table (Specialized Sources)
#---------------------------
resource "aws_dynamodb_table" "tier3_cache" {
  count = var.deploy_dynamodb ? 1 : 0

  name         = "${var.name_prefix}-tier3-cache"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "cache_key"

  attribute {
    name = "cache_key"
    type = "S"  # domain:query_hash
  }

  attribute {
    name = "domain"
    type = "S"  # news, medical, philosophy, etc.
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

  # GSI for domain-based queries
  global_secondary_index {
    name            = "domain-index"
    hash_key        = "domain"
    projection_type = "ALL"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  dynamic "replica" {
    for_each = var.enable_dynamodb_global_tables ? [var.dr_region] : []
    content {
      region_name = replica.value
    }
  }

  tags = merge(
    var.tags,
    {
      Name      = "${var.name_prefix}-tier3-cache"
      DataClass = "Cache"
      Service   = "TORON"
    }
  )
}

#---------------------------
# Session Table (User Sessions)
#---------------------------
resource "aws_dynamodb_table" "sessions" {
  count = var.deploy_dynamodb ? 1 : 0

  name         = "${var.name_prefix}-sessions"
  billing_mode = var.dynamodb_billing_mode
  hash_key     = "session_id"

  attribute {
    name = "session_id"
    type = "S"
  }

  attribute {
    name = "user_id"
    type = "S"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  # GSI for user-based queries
  global_secondary_index {
    name            = "user-sessions-index"
    hash_key        = "user_id"
    projection_type = "ALL"
  }

  tags = merge(
    var.tags,
    {
      Name      = "${var.name_prefix}-sessions"
      DataClass = "PII"
      Service   = "Auth"
    }
  )
}
