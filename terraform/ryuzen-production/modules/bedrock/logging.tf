#############################
# Bedrock Module
# CloudWatch Logging for Guardrails
#############################

#---------------------------
# Log Group for Guardrail Blocks
#---------------------------
resource "aws_cloudwatch_log_group" "guardrail_blocks" {
  name              = "/aws/bedrock/${var.name_prefix}/guardrail-blocks"
  retention_in_days = var.log_retention_days

  kms_key_id = var.kms_key_arn

  tags = merge(
    var.tags,
    {
      Name    = "${var.name_prefix}-guardrail-blocks"
      Purpose = "GuardrailAudit"
    }
  )
}

#---------------------------
# Log Group for Model Invocations
#---------------------------
resource "aws_cloudwatch_log_group" "model_invocations" {
  name              = "/aws/bedrock/${var.name_prefix}/model-invocations"
  retention_in_days = var.log_retention_days

  kms_key_id = var.kms_key_arn

  tags = merge(
    var.tags,
    {
      Name    = "${var.name_prefix}-model-invocations"
      Purpose = "ModelAudit"
    }
  )
}

#---------------------------
# Log Group for Disclaimer Events
#---------------------------
resource "aws_cloudwatch_log_group" "disclaimer_events" {
  name              = "/aws/bedrock/${var.name_prefix}/disclaimer-events"
  retention_in_days = var.log_retention_days

  kms_key_id = var.kms_key_arn

  tags = merge(
    var.tags,
    {
      Name    = "${var.name_prefix}-disclaimer-events"
      Purpose = "DisclaimerTracking"
    }
  )
}

#---------------------------
# Metric Filter: Total Guardrail Blocks
#---------------------------
resource "aws_cloudwatch_log_metric_filter" "guardrail_blocks_count" {
  name           = "${var.name_prefix}-guardrail-blocks-count"
  log_group_name = aws_cloudwatch_log_group.guardrail_blocks.name
  pattern        = "{ $.action = \"BLOCKED\" }"

  metric_transformation {
    name          = "GuardrailBlocks"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
  }
}

#---------------------------
# Metric Filter: Block by Reason
#---------------------------
resource "aws_cloudwatch_log_metric_filter" "block_reason_content" {
  name           = "${var.name_prefix}-block-reason-content"
  log_group_name = aws_cloudwatch_log_group.guardrail_blocks.name
  pattern        = "{ $.blockReason = \"CONTENT_POLICY\" }"

  metric_transformation {
    name          = "GuardrailBlocksContent"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
    dimensions = {
      BlockReason = "CONTENT_POLICY"
    }
  }
}

resource "aws_cloudwatch_log_metric_filter" "block_reason_topic" {
  name           = "${var.name_prefix}-block-reason-topic"
  log_group_name = aws_cloudwatch_log_group.guardrail_blocks.name
  pattern        = "{ $.blockReason = \"TOPIC_POLICY\" }"

  metric_transformation {
    name          = "GuardrailBlocksTopic"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
    dimensions = {
      BlockReason = "TOPIC_POLICY"
    }
  }
}

resource "aws_cloudwatch_log_metric_filter" "block_reason_word" {
  name           = "${var.name_prefix}-block-reason-word"
  log_group_name = aws_cloudwatch_log_group.guardrail_blocks.name
  pattern        = "{ $.blockReason = \"WORD_POLICY\" }"

  metric_transformation {
    name          = "GuardrailBlocksWord"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
    dimensions = {
      BlockReason = "WORD_POLICY"
    }
  }
}

resource "aws_cloudwatch_log_metric_filter" "block_reason_pii" {
  name           = "${var.name_prefix}-block-reason-pii"
  log_group_name = aws_cloudwatch_log_group.guardrail_blocks.name
  pattern        = "{ $.blockReason = \"SENSITIVE_INFORMATION_POLICY\" }"

  metric_transformation {
    name          = "GuardrailBlocksPII"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
    dimensions = {
      BlockReason = "PII"
    }
  }
}

resource "aws_cloudwatch_log_metric_filter" "block_reason_prompt_attack" {
  name           = "${var.name_prefix}-block-reason-prompt-attack"
  log_group_name = aws_cloudwatch_log_group.guardrail_blocks.name
  pattern        = "{ $.blockReason = \"PROMPT_ATTACK\" }"

  metric_transformation {
    name          = "GuardrailBlocksPromptAttack"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
    dimensions = {
      BlockReason = "PROMPT_ATTACK"
    }
  }
}

#---------------------------
# Metric Filter: Emergency Detected
#---------------------------
resource "aws_cloudwatch_log_metric_filter" "emergency_detected" {
  name           = "${var.name_prefix}-emergency-detected"
  log_group_name = aws_cloudwatch_log_group.disclaimer_events.name
  pattern        = "{ $.domain = \"emergency\" }"

  metric_transformation {
    name          = "EmergencyDetected"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
  }
}

#---------------------------
# Metric Filter: Disclaimer by Domain
#---------------------------
resource "aws_cloudwatch_log_metric_filter" "disclaimer_medical" {
  name           = "${var.name_prefix}-disclaimer-medical"
  log_group_name = aws_cloudwatch_log_group.disclaimer_events.name
  pattern        = "{ $.domain = \"medical\" }"

  metric_transformation {
    name          = "DisclaimersMedical"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
    dimensions = {
      Domain = "medical"
    }
  }
}

resource "aws_cloudwatch_log_metric_filter" "disclaimer_financial" {
  name           = "${var.name_prefix}-disclaimer-financial"
  log_group_name = aws_cloudwatch_log_group.disclaimer_events.name
  pattern        = "{ $.domain = \"financial\" }"

  metric_transformation {
    name          = "DisclaimersFinancial"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
    dimensions = {
      Domain = "financial"
    }
  }
}

resource "aws_cloudwatch_log_metric_filter" "disclaimer_legal" {
  name           = "${var.name_prefix}-disclaimer-legal"
  log_group_name = aws_cloudwatch_log_group.disclaimer_events.name
  pattern        = "{ $.domain = \"legal\" }"

  metric_transformation {
    name          = "DisclaimersLegal"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
    dimensions = {
      Domain = "legal"
    }
  }
}

#---------------------------
# Metric Filter: Model Disagreement
#---------------------------
resource "aws_cloudwatch_log_metric_filter" "model_disagreement" {
  name           = "${var.name_prefix}-model-disagreement"
  log_group_name = aws_cloudwatch_log_group.model_invocations.name
  pattern        = "{ $.agreementRatio < 0.75 }"

  metric_transformation {
    name          = "ModelDisagreement"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
  }
}

#---------------------------
# Metric Filter: Tier 4 Invocations
#---------------------------
resource "aws_cloudwatch_log_metric_filter" "tier4_invoked" {
  name           = "${var.name_prefix}-tier4-invoked"
  log_group_name = aws_cloudwatch_log_group.model_invocations.name
  pattern        = "{ $.tier = 4 }"

  metric_transformation {
    name          = "Tier4Invocations"
    namespace     = "Ryuzen/Bedrock"
    value         = "1"
    default_value = "0"
  }
}

#---------------------------
# Log Subscription for Real-Time Alerting
#---------------------------
resource "aws_cloudwatch_log_subscription_filter" "guardrail_blocks_to_sns" {
  count = var.alerts_sns_topic_arn != "" ? 1 : 0

  name            = "${var.name_prefix}-guardrail-blocks-subscription"
  log_group_name  = aws_cloudwatch_log_group.guardrail_blocks.name
  filter_pattern  = "{ $.action = \"BLOCKED\" }"
  destination_arn = var.alerts_sns_topic_arn

  depends_on = [aws_cloudwatch_log_group.guardrail_blocks]
}
