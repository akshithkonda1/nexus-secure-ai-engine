resource "aws_ecs_cluster" "telemetry" {
  name = "ryuzen-telemetry-cluster"
}

resource "aws_security_group" "bundle_task" {
  name        = "ryuzen-bundle-task-sg"
  description = "Security group for bundle generation tasks"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

locals {
  bundle_env = [
    {
      name  = "SANITIZED_BUCKET"
      value = aws_s3_bucket.sanitized.bucket
    },
    {
      name  = "ANALYTICS_BUCKET"
      value = aws_s3_bucket.analytics.bucket
    },
    {
      name  = "PARTNER_BUCKET"
      value = aws_s3_bucket.partner.bucket
    },
    {
      name  = "AUDIT_TABLE"
      value = aws_dynamodb_table.telemetry_audit.name
    },
  ]
}

resource "aws_ecs_task_definition" "bundle" {
  family                   = "ryuzen-telemetry-bundle"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.bundle_task_execution.arn
  task_role_arn            = aws_iam_role.bundle_task.arn

  container_definitions = jsonencode([
    {
      name      = "bundle-builder"
      image     = var.bundle_task_image
      essential = true
      entryPoint = ["python", "generate_all_bundles.py"]
      environment = local.bundle_env
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-region        = var.aws_region
          awslogs-group         = "/aws/ecs/ryuzen-bundle"
          awslogs-stream-prefix = "bundle"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "bundle" {
  name            = "ryuzen-bundle-service"
  cluster         = aws_ecs_cluster.telemetry.id
  task_definition = aws_ecs_task_definition.bundle.arn
  desired_count   = 0

  launch_type = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    assign_public_ip = true
    security_groups = [aws_security_group.bundle_task.id]
  }
}
