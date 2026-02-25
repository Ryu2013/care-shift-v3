# CloudFront用 ACM証明書（us-east-1）
resource "aws_acm_certificate" "cloudfront" {
  provider          = aws.us_east_1
  domain_name       = "www.ryuuichi-app.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project}-cloudfront-cert"
  }
}

# ALB用 ACM証明書（ap-northeast-1）
resource "aws_acm_certificate" "alb" {
  domain_name       = "origin.ryuuichi-app.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project}-alb-cert"
  }
}
