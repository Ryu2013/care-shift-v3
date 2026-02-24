variable "aws_region" {
  type    = string
  default = "ap-northeast-1"
}

variable "project" {
  type    = string
  default = "care-shift-v3"
}

variable "github_owner" {
  type    = string
  default = "Ryu2013"
}

variable "github_repo" {
  type    = string
  default = "care-shift-v3"
}

variable "tfstate_bucket_name" {
  type        = string
  description = "bootstrapで作成したS3バケット名"
  default     = "care-shift-v3-tfstate-079760567374"
}

variable "tfstate_lock_table_name" {
  type        = string
  description = "bootstrapで作成したDynamoDBテーブル名"
  default     = "care-shift-v3-tfstate-lock"
}
