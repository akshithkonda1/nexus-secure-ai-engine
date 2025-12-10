resource "aws_api_gateway_rest_api" "telemetry" {
  name        = "ryuzen-telemetry-api"
  description = "API Gateway for telemetry ingestion"
}

resource "aws_api_gateway_resource" "ingest" {
  rest_api_id = aws_api_gateway_rest_api.telemetry.id
  parent_id   = aws_api_gateway_rest_api.telemetry.root_resource_id
  path_part   = "ingest"
}

resource "aws_api_gateway_method" "ingest_post" {
  rest_api_id   = aws_api_gateway_rest_api.telemetry.id
  resource_id   = aws_api_gateway_resource.ingest.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "ingest_post" {
  rest_api_id             = aws_api_gateway_rest_api.telemetry.id
  resource_id             = aws_api_gateway_resource.ingest.id
  http_method             = aws_api_gateway_method.ingest_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.ingest.invoke_arn
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingest.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.telemetry.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "telemetry" {
  depends_on = [aws_api_gateway_integration.ingest_post]

  rest_api_id = aws_api_gateway_rest_api.telemetry.id
  stage_name  = "v1"
}
