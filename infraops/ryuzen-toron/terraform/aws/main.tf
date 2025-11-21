provider "aws" {
  region = "us-east-1"
}

module "eks" {
  source         = "terraform-aws-modules/eks/aws"
  version        = "19.18.0"
  cluster_name   = "ryuzen-cluster"
  cluster_version = "1.29"
}

module "ecr" {
  source = "terraform-aws-modules/ecr/aws"
  name   = "ryuzen-engine"
}
