resource "aws_cloudfront_response_headers_policy" "frontend_csp" {
  name    = "${var.project}-frontend-csp"
  comment = "CSP for frontend assets served by CloudFront"

  security_headers_config {
    content_security_policy {
      override = true
      content_security_policy = join(" ", [
        "default-src 'self';",
        "script-src 'self' https://www.googletagmanager.com;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
        "img-src 'self' https://www.google-analytics.com;",
        "font-src 'self' https://fonts.gstatic.com;",
        "connect-src 'self' https://www.ryuuichi-app.com wss://www.ryuuichi-app.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com;",
        "object-src 'none';",
        "base-uri 'self';",
        "frame-ancestors 'self';",
      ])
    }
  }
}

resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  aliases         = ["www.ryuuichi-app.com"]
  comment         = "task-app-cdn"
  price_class     = "PriceClass_All"
  http_version    = "http2"
  is_ipv6_enabled = true

  web_acl_id = "arn:aws:wafv2:us-east-1:079760567374:global/webacl/CreatedByCloudFront-c3fc1fc1/487512f4-ec7b-4d8e-aad1-36567f9d1fda"

  # S3オリジン（フロントエンド）
  origin {
    origin_id                = "s3-frontend"
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # ALBオリジン（バックエンドAPI）
  origin {
    origin_id   = "alb-backend"
    domain_name = "origin.ryuuichi-app.com"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # デフォルト → S3（フロントエンド）
  default_cache_behavior {
    target_origin_id           = "s3-frontend"
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.frontend_csp.id
  }

  # /api/* → ALB（キャッシュ無効・全ヘッダー転送）
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "alb-backend"
    viewer_protocol_policy = "https-only"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]

    # CachingDisabled
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    # AllViewerExceptHostHeader（Cookie・クエリ文字列・ヘッダーをALBに転送）
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
  }

  custom_error_response {
    error_code            = 403
    response_page_path    = "/index.html"
    response_code         = "200"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_page_path    = "/index.html"
    response_code         = "200"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cloudfront.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.project}-cdn"
  }
}
