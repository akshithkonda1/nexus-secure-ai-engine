#############################
# Bedrock Module
# Variables
#############################

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "bedrock_models" {
  description = "List of Bedrock model IDs to enable"
  type        = list(string)
  default     = []
}

variable "lambda_role_arn" {
  description = "Lambda execution role ARN"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}

#---------------------------
# Guardrails Variables
#---------------------------

variable "kms_key_arn" {
  description = "KMS key ARN for encrypting CloudWatch logs"
  type        = string
  default     = ""
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 90
}

variable "alerts_sns_topic_arn" {
  description = "SNS topic ARN for general alerts"
  type        = string
  default     = ""
}

variable "critical_alerts_sns_arn" {
  description = "SNS topic ARN for critical alerts (security incidents)"
  type        = string
  default     = ""
}

variable "enable_guardrails" {
  description = "Whether to enable Bedrock guardrails"
  type        = bool
  default     = true
}

variable "guardrail_content_filter_strength" {
  description = "Default content filter strength (NONE, LOW, MEDIUM, HIGH)"
  type        = string
  default     = "MEDIUM"

  validation {
    condition     = contains(["NONE", "LOW", "MEDIUM", "HIGH"], var.guardrail_content_filter_strength)
    error_message = "Valid values: NONE, LOW, MEDIUM, HIGH"
  }
}

variable "guardrail_grounding_threshold" {
  description = "Contextual grounding threshold (0.0 to 1.0)"
  type        = number
  default     = 0.7

  validation {
    condition     = var.guardrail_grounding_threshold >= 0.0 && var.guardrail_grounding_threshold <= 1.0
    error_message = "Grounding threshold must be between 0.0 and 1.0"
  }
}

variable "guardrail_relevance_threshold" {
  description = "Relevance threshold (0.0 to 1.0)"
  type        = number
  default     = 0.7

  validation {
    condition     = var.guardrail_relevance_threshold >= 0.0 && var.guardrail_relevance_threshold <= 1.0
    error_message = "Relevance threshold must be between 0.0 and 1.0"
  }
}

variable "enable_pii_detection" {
  description = "Whether to enable PII detection in guardrails"
  type        = bool
  default     = true
}

variable "enable_prompt_attack_detection" {
  description = "Whether to enable prompt injection attack detection"
  type        = bool
  default     = true
}

variable "blocked_input_message" {
  description = "Message shown when input is blocked by guardrails"
  type        = string
  default     = "I apologize, but I cannot process this request as it may contain harmful content or attempt to bypass safety guidelines. Please rephrase your question."
}

variable "blocked_output_message" {
  description = "Message shown when output is blocked by guardrails"
  type        = string
  default     = "I apologize, but I cannot provide this response as it may contain harmful or inappropriate content. Please try rephrasing your question."
}
