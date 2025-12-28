#############################
# Networking Module
# Application Load Balancer
#############################

#---------------------------
# Application Load Balancer
#---------------------------
resource "aws_lb" "main" {
  name               = "${var.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  # Enable deletion protection in production
  enable_deletion_protection = var.environment == "production"

  # Enable access logs
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.id
    prefix  = "alb"
    enabled = true
  }

  # Drop invalid headers for security
  drop_invalid_header_fields = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-alb"
    }
  )
}

#---------------------------
# ALB Access Logs Bucket
#---------------------------
resource "aws_s3_bucket" "alb_logs" {
  bucket        = "${var.name_prefix}-alb-logs-${data.aws_caller_identity.current.account_id}"
  force_destroy = var.environment != "production"

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-alb-logs"
    }
  )
}

resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = data.aws_elb_service_account.main.arn
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_logs.arn}/alb/*"
      }
    ]
  })
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    id     = "expire-logs"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

#---------------------------
# Target Group for Lambda
#---------------------------
resource "aws_lb_target_group" "lambda" {
  name        = "${var.name_prefix}-lambda-tg"
  target_type = "lambda"

  health_check {
    enabled             = true
    interval            = 35
    path                = "/health"
    timeout             = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-lambda-tg"
    }
  )
}

#---------------------------
# HTTPS Listener
#---------------------------
resource "aws_lb_listener" "https" {
  count = var.route53_zone_id != "" ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lambda.arn
  }
}

#---------------------------
# HTTP Listener (Redirect to HTTPS)
#---------------------------
resource "aws_lb_listener" "http_redirect" {
  count = var.route53_zone_id != "" ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

#---------------------------
# HTTP Listener (for testing without SSL)
#---------------------------
resource "aws_lb_listener" "http" {
  count = var.route53_zone_id == "" ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lambda.arn
  }
}

#---------------------------
# Data Sources
#---------------------------
data "aws_caller_identity" "current" {}

data "aws_elb_service_account" "main" {}
