resource "aws_cloudfront_distribution" "main" {
  enabled         = false
  aliases         = ["www.ryuuichi-app.com"]
  comment         = "task-app-cdn"
  price_class     = "PriceClass_All"
  http_version    = "http2"
  is_ipv6_enabled = true

  web_acl_id = "arn:aws:wafv2:us-east-1:079760567374:global/webacl/CreatedByCloudFront-c3fc1fc1/487512f4-ec7b-4d8e-aad1-36567f9d1fda"

  # デフォルトオリジン（後でS3に変更予定）
  origin {
    origin_id                = "task-app-s3-ryuuiti.s3.amazonaws.com-mjw4l52uzlg"
    domain_name              = "temp-delete-bucket-xxxx.s3.ap-northeast-1.amazonaws.com"
    origin_access_control_id = "E1FYB0HHVZOCRA"

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  default_cache_behavior {
    target_origin_id       = "task-app-s3-ryuuiti.s3.amazonaws.com-mjw4l52uzlg"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
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
