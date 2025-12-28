#############################
# Ryuzen Production Infrastructure
# AWS Provider Configuration
#############################

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project          = "Ryuzen"
      Environment      = var.environment
      ManagedBy        = "Terraform"
      Owner            = "Akshith"
      CostCenter       = "TORON"
      DataClassification = "Confidential"
      Compliance       = join(",", var.compliance_frameworks)
    }
  }
}

# Provider for ACM certificates (must be in us-east-1 for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project          = "Ryuzen"
      Environment      = var.environment
      ManagedBy        = "Terraform"
      Owner            = "Akshith"
      CostCenter       = "TORON"
    }
  }
}

# Provider for disaster recovery region
provider "aws" {
  alias  = "dr_region"
  region = var.dr_region

  default_tags {
    tags = {
      Project          = "Ryuzen"
      Environment      = var.environment
      ManagedBy        = "Terraform"
      Owner            = "Akshith"
      CostCenter       = "TORON"
      Purpose          = "DisasterRecovery"
    }
  }
}
