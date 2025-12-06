resource "aws_dynamodb_table" "telemetry_audit" {
  name         = var.audit_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "event_id"
  range_key    = "event_timestamp"

  attribute {
    name = "event_id"
    type = "S"
  }

  attribute {
    name = "event_timestamp"
    type = "S"
  }

  attribute {
    name = "partner_id"
    type = "S"
  }

  attribute {
    name = "bundle_month"
    type = "S"
  }

  global_secondary_index {
    name            = "partner_month_index"
    hash_key        = "partner_id"
    range_key       = "bundle_month"
    projection_type = "ALL"
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
    kms_key_arn = aws_kms_key.dynamodb.arn
  }
}
