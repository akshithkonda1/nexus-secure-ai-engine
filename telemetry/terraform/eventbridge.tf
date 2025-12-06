resource "aws_iam_role" "eventbridge_ecs" {
  name               = "ryuzen-eventbridge-ecs-role"
  assume_role_policy = data.aws_iam_policy_document.eventbridge_assume.json
}

data "aws_iam_policy_document" "eventbridge_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "eventbridge_run_task" {
  statement {
    effect = "Allow"
    actions = ["ecs:RunTask"]
    resources = [aws_ecs_task_definition.bundle.arn]
  }

  statement {
    effect = "Allow"
    actions = ["iam:PassRole"]
    resources = [aws_iam_role.bundle_task.arn, aws_iam_role.bundle_task_execution.arn]
  }
}

resource "aws_iam_role_policy" "eventbridge_run_task" {
  name   = "ryuzen-eventbridge-run-task"
  role   = aws_iam_role.eventbridge_ecs.id
  policy = data.aws_iam_policy_document.eventbridge_run_task.json
}

resource "aws_cloudwatch_event_rule" "monthly_bundle" {
  name                = "ryuzen-monthly-bundle"
  description         = "Monthly trigger for partner bundle generation"
  schedule_expression = var.monthly_schedule_expression
}

resource "aws_cloudwatch_event_target" "bundle_task" {
  rule      = aws_cloudwatch_event_rule.monthly_bundle.name
  target_id = "run-bundle-task"
  arn       = aws_ecs_cluster.telemetry.arn
  role_arn  = aws_iam_role.eventbridge_ecs.arn

  ecs_target {
    launch_type         = "FARGATE"
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.bundle.arn

    network_configuration {
      subnets         = var.private_subnet_ids
      assign_public_ip = true
      security_groups = [aws_security_group.bundle_task.id]
    }
  }
}
