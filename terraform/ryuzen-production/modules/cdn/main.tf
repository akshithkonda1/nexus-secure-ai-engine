#############################
# CDN Module
# CloudFront Distribution
#############################

#---------------------------
# Origin Access Control
#---------------------------
resource "aws_cloudfront_origin_access_control" "main" {
  name                              = "${var.name_prefix}-oac"
  description                       = "OAC for ${var.name_prefix}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

#---------------------------
# CloudFront Distribution
#---------------------------
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Ryuzen Workspace - ${var.environment}"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"  # US, Canada, Europe
  aliases             = var.acm_certificate_arn != "" ? ["${var.workspace_subdomain}.${var.domain_name}"] : []
  web_acl_id          = var.web_acl_arn != "" ? var.web_acl_arn : null

  origin {
    domain_name              = var.static_assets_bucket_domain_name
    origin_id                = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # SPA routing - return index.html for 404s
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = var.acm_certificate_arn != "" ? var.acm_certificate_arn : null
    cloudfront_default_certificate = var.acm_certificate_arn == ""
    ssl_support_method             = var.acm_certificate_arn != "" ? "sni-only" : null
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-distribution"
    }
  )
}

#---------------------------
# S3 Bucket Policy for CloudFront
#---------------------------
resource "aws_s3_bucket_policy" "static_assets" {
  bucket = var.static_assets_bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAC"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${var.static_assets_bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}
