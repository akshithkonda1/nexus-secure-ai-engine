#############################
# Ryuzen Production Infrastructure
# Remote State Configuration
#############################

terraform {
  backend "s3" {
    # These values are typically provided via -backend-config during terraform init
    # Example: terraform init -backend-config=environments/production.backend.hcl

    bucket         = "ryuzen-terraform-state"
    key            = "ryuzen-production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ryuzen-terraform-locks"

    # Enable state locking for team collaboration
    # The DynamoDB table must have a primary key named LockID (String)
  }
}

# Note: Create the S3 bucket and DynamoDB table manually before running terraform init
#
# S3 Bucket Requirements:
# - Versioning enabled
# - Server-side encryption with AWS KMS
# - Block all public access
# - Lifecycle rules for old versions
#
# DynamoDB Table Requirements:
# - Table name: ryuzen-terraform-locks
# - Primary key: LockID (String)
# - On-demand billing mode
#
# Example bootstrap commands:
#
# aws s3api create-bucket \
#   --bucket ryuzen-terraform-state \
#   --region us-east-1
#
# aws s3api put-bucket-versioning \
#   --bucket ryuzen-terraform-state \
#   --versioning-configuration Status=Enabled
#
# aws s3api put-bucket-encryption \
#   --bucket ryuzen-terraform-state \
#   --server-side-encryption-configuration '{
#     "Rules": [{
#       "ApplyServerSideEncryptionByDefault": {
#         "SSEAlgorithm": "aws:kms"
#       },
#       "BucketKeyEnabled": true
#     }]
#   }'
#
# aws dynamodb create-table \
#   --table-name ryuzen-terraform-locks \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST
