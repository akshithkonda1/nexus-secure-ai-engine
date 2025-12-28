#############################
# DNS Module
# Route 53, ACM, Health Checks
#############################

#---------------------------
# Route 53 Hosted Zone
#---------------------------
resource "aws_route53_zone" "main" {
  count = var.create_dns_zone ? 1 : 0

  name    = var.domain_name
  comment = "Managed by Terraform - Ryuzen ${var.environment}"

  tags = merge(
    var.tags,
    {
      Name = var.domain_name
    }
  )
}

locals {
  zone_id = var.create_dns_zone ? aws_route53_zone.main[0].zone_id : var.route53_zone_id
}

#---------------------------
# ACM Certificate
#---------------------------
resource "aws_acm_certificate" "main" {
  provider = aws.us_east_1  # Must be in us-east-1 for CloudFront

  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-certificate"
    }
  )
}

#---------------------------
# DNS Validation Records
#---------------------------
resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.zone_id
}

resource "aws_acm_certificate_validation" "main" {
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

#---------------------------
# API Record (ALB)
#---------------------------
resource "aws_route53_record" "api" {
  count = var.alb_dns_name != "" ? 1 : 0

  zone_id = local.zone_id
  name    = "${var.api_subdomain}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

#---------------------------
# Workspace Record (CloudFront)
#---------------------------
resource "aws_route53_record" "workspace" {
  count = var.cloudfront_domain_name != "" ? 1 : 0

  zone_id = local.zone_id
  name    = "${var.workspace_subdomain}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}

#---------------------------
# Health Checks
#---------------------------
resource "aws_route53_health_check" "api" {
  count = var.alb_dns_name != "" ? 1 : 0

  fqdn              = "${var.api_subdomain}.${var.domain_name}"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = "3"
  request_interval  = "30"

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-api-health"
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "api_health" {
  count = var.alb_dns_name != "" ? 1 : 0

  alarm_name          = "${var.name_prefix}-api-health-check"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = "60"
  statistic           = "Minimum"
  threshold           = "1"
  alarm_description   = "API health check failed"

  dimensions = {
    HealthCheckId = aws_route53_health_check.api[0].id
  }

  tags = var.tags
}
