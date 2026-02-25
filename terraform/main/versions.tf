terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "care-shift-v3-tfstate-079760567374"
    key            = "main/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "care-shift-v3-tfstate-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# CloudFront用（ACM証明書はus-east-1必須）
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
