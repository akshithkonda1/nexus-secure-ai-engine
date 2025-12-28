#############################
# Compute Module
# Provisioned Concurrency
#############################

#---------------------------
# TORON Lambda Alias
#---------------------------
resource "aws_lambda_alias" "toron_live" {
  count = var.deploy_toron_lambda ? 1 : 0

  name             = "live"
  description      = "Production traffic alias"
  function_name    = aws_lambda_function.toron[0].function_name
  function_version = aws_lambda_function.toron[0].version

  # Routing configuration for canary deployments
  # routing_config {
  #   additional_version_weights = {
  #     "2" = 0.1  # 10% to new version
  #   }
  # }
}

#---------------------------
# TORON Provisioned Concurrency
#---------------------------
resource "aws_lambda_provisioned_concurrency_config" "toron" {
  count = var.deploy_toron_lambda && var.provisioned_concurrency_toron > 0 ? 1 : 0

  function_name                     = aws_lambda_function.toron[0].function_name
  provisioned_concurrent_executions = var.provisioned_concurrency_toron
  qualifier                         = aws_lambda_alias.toron_live[0].name
}

#---------------------------
# Workspace Lambda Alias
#---------------------------
resource "aws_lambda_alias" "workspace_live" {
  count = var.deploy_workspace_lambda ? 1 : 0

  name             = "live"
  description      = "Production traffic alias"
  function_name    = aws_lambda_function.workspace[0].function_name
  function_version = aws_lambda_function.workspace[0].version
}

#---------------------------
# Workspace Provisioned Concurrency
#---------------------------
resource "aws_lambda_provisioned_concurrency_config" "workspace" {
  count = var.deploy_workspace_lambda && var.provisioned_concurrency_workspace > 0 ? 1 : 0

  function_name                     = aws_lambda_function.workspace[0].function_name
  provisioned_concurrent_executions = var.provisioned_concurrency_workspace
  qualifier                         = aws_lambda_alias.workspace_live[0].name
}

#---------------------------
# OAuth Lambda Alias
#---------------------------
resource "aws_lambda_alias" "oauth_live" {
  count = var.deploy_oauth_lambda ? 1 : 0

  name             = "live"
  description      = "Production traffic alias"
  function_name    = aws_lambda_function.oauth[0].function_name
  function_version = aws_lambda_function.oauth[0].version
}

#---------------------------
# Auto Scaling for Provisioned Concurrency
#---------------------------
resource "aws_appautoscaling_target" "toron_concurrency" {
  count = var.deploy_toron_lambda && var.provisioned_concurrency_toron > 0 ? 1 : 0

  max_capacity       = var.reserved_concurrency_toron
  min_capacity       = var.provisioned_concurrency_toron
  resource_id        = "function:${aws_lambda_function.toron[0].function_name}:${aws_lambda_alias.toron_live[0].name}"
  scalable_dimension = "lambda:function:ProvisionedConcurrency"
  service_namespace  = "lambda"
}

resource "aws_appautoscaling_policy" "toron_concurrency" {
  count = var.deploy_toron_lambda && var.provisioned_concurrency_toron > 0 ? 1 : 0

  name               = "${var.name_prefix}-toron-concurrency-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.toron_concurrency[0].resource_id
  scalable_dimension = aws_appautoscaling_target.toron_concurrency[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.toron_concurrency[0].service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 0.7  # Scale when 70% of provisioned concurrency is utilized

    predefined_metric_specification {
      predefined_metric_type = "LambdaProvisionedConcurrencyUtilization"
    }

    scale_in_cooldown  = 60   # 1 minute before scaling in
    scale_out_cooldown = 0    # Immediate scale out
  }
}

#---------------------------
# Scheduled Scaling for Peak Hours
#---------------------------
resource "aws_appautoscaling_scheduled_action" "toron_peak_morning" {
  count = var.deploy_toron_lambda && var.provisioned_concurrency_toron > 0 && var.environment == "production" ? 1 : 0

  name               = "${var.name_prefix}-toron-peak-morning"
  service_namespace  = aws_appautoscaling_target.toron_concurrency[0].service_namespace
  resource_id        = aws_appautoscaling_target.toron_concurrency[0].resource_id
  scalable_dimension = aws_appautoscaling_target.toron_concurrency[0].scalable_dimension

  schedule = "cron(0 8 ? * MON-FRI *)"  # 8 AM UTC on weekdays

  scalable_target_action {
    min_capacity = var.provisioned_concurrency_toron * 2
    max_capacity = var.reserved_concurrency_toron
  }
}

resource "aws_appautoscaling_scheduled_action" "toron_off_peak" {
  count = var.deploy_toron_lambda && var.provisioned_concurrency_toron > 0 && var.environment == "production" ? 1 : 0

  name               = "${var.name_prefix}-toron-off-peak"
  service_namespace  = aws_appautoscaling_target.toron_concurrency[0].service_namespace
  resource_id        = aws_appautoscaling_target.toron_concurrency[0].resource_id
  scalable_dimension = aws_appautoscaling_target.toron_concurrency[0].scalable_dimension

  schedule = "cron(0 22 ? * * *)"  # 10 PM UTC daily

  scalable_target_action {
    min_capacity = var.provisioned_concurrency_toron
    max_capacity = var.reserved_concurrency_toron
  }
}
