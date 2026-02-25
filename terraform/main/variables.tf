variable "aws_region" {
  type    = string
  default = "ap-northeast-1"
}

variable "project" {
  type    = string
  default = "care-shift-v3"
}

variable "db_password" {
  type      = string
  sensitive = true
}
