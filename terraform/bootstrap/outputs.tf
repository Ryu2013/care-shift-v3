output "tfstate_bucket_name" {
  value       = aws_s3_bucket.tfstate.id
  description = "Terraform stateを保存するS3バケット名"
}

output "tfstate_lock_table_name" {
  value       = aws_dynamodb_table.tfstate_lock.id
  description = "Terraform stateロック用DynamoDBテーブル名"
}

