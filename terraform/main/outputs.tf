# お名前.comに追加するACMのDNSバリデーション用CNAMEレコード
output "acm_cloudfront_validation_records" {
  description = "CloudFront用ACM証明書のDNSバリデーションレコード（お名前.comに追加）"
  value = {
    for dvo in aws_acm_certificate.cloudfront.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}

output "acm_alb_validation_records" {
  description = "ALB用ACM証明書のDNSバリデーションレコード（お名前.comに追加）"
  value = {
    for dvo in aws_acm_certificate.alb.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}
