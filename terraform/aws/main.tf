#############################
# AWS Toron IaC
# Provisions ECR + ECS Fargate service with networking and IAM.
#############################

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Configure remote state (override with -backend-config during init)
  backend "s3" {
    bucket = "toron-terraform-state"
    key    = "aws/toron.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}

# Available AZ data source for subnet distribution
data "aws_availability_zones" "available" {}

# Networking for ECS tasks
resource "aws_vpc" "toron" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "toron-vpc" }
}

resource "aws_internet_gateway" "toron" {
  vpc_id = aws_vpc.toron.id
  tags   = { Name = "toron-igw" }
}

resource "aws_subnet" "toron_public" {
  count                   = 2
  vpc_id                  = aws_vpc.toron.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "toron-public-${count.index}" }
}

resource "aws_route_table" "toron" {
  vpc_id = aws_vpc.toron.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.toron.id
  }
  tags = { Name = "toron-rt" }
}

resource "aws_route_table_association" "toron_assoc" {
  count          = length(aws_subnet.toron_public)
  subnet_id      = aws_subnet.toron_public[count.index].id
  route_table_id = aws_route_table.toron.id
}

# Security group for ingress/egress control
resource "aws_security_group" "toron" {
  name        = "toron-sg"
  description = "Allow HTTP access to Toron service"
  vpc_id      = aws_vpc.toron.id

  ingress {
    from_port   = var.container_port
    to_port     = var.container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "toron-sg" }
}

resource "aws_ecr_repository" "toron" {
  name                 = "toron-engine"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

# Log group for task stdout
resource "aws_cloudwatch_log_group" "toron" {
  name              = "/ecs/toron"
  retention_in_days = 14
}

# IAM role for ECS task execution
resource "aws_iam_role" "task_execution" {
  name               = "toron-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
}

data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_cluster" "toron" {
  name = "toron-cluster"
}

# Task definition for the Toron container
resource "aws_ecs_task_definition" "toron" {
  family                   = "toron-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "toron",
      image     = "${aws_ecr_repository.toron.repository_url}:${var.image_tag}",
      essential = true,
      portMappings = [
        {
          containerPort = var.container_port,
          hostPort      = var.container_port,
          protocol      = "tcp"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.toron.name,
          awslogs-region        = var.region,
          awslogs-stream-prefix = "ecs"
        }
      },
      environment = [
        { name = "TORON_PORT", value = tostring(var.container_port) }
      ]
    }
  ])
}

resource "aws_ecs_service" "toron" {
  name            = "toron-service"
  cluster         = aws_ecs_cluster.toron.id
  task_definition = aws_ecs_task_definition.toron.arn
  desired_count   = var.replica_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = aws_subnet.toron_public[*].id
    security_groups = [aws_security_group.toron.id]
    assign_public_ip = true
  }
  depends_on = [aws_iam_role_policy_attachment.task_execution]
}
