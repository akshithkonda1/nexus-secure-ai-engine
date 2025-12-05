#!/usr/bin/env bash
set -euo pipefail

# Shifts traffic between blue and green stacks using ALB and CloudFront.
# Requirements: aws cli v2, jq, environment variables for AWS credentials.

STACK=${1:-}
PERCENTAGE=${2:-100}
ALB_LISTENER_ARN=${ALB_LISTENER_ARN:-""}
BLUE_TG_ARN=${BLUE_TG_ARN:-""}
GREEN_TG_ARN=${GREEN_TG_ARN:-""}
CLOUDFRONT_DIST_ID=${CLOUDFRONT_DIST_ID:-""}
ROUTE53_ZONE_ID=${ROUTE53_ZONE_ID:-""}
ROUTE53_RECORD_NAME=${ROUTE53_RECORD_NAME:-""}

usage() {
  cat <<USAGE
Usage: ALB_LISTENER_ARN=... BLUE_TG_ARN=... GREEN_TG_ARN=... \ \
       ./traffic_shift.sh <blue|green> [percentage]

Environment variables:
  CLOUDFRONT_DIST_ID      Optional. CloudFront distribution to update origin weights.
  ROUTE53_ZONE_ID         Optional. Route53 zone for weighted DNS.
  ROUTE53_RECORD_NAME     Optional. Record name for weighted DNS adjustments.
USAGE
}

if [[ -z "$STACK" || -z "$ALB_LISTENER_ARN" || -z "$BLUE_TG_ARN" || -z "$GREEN_TG_ARN" ]]; then
  usage
  exit 1
fi

if [[ "$STACK" != "blue" && "$STACK" != "green" ]]; then
  echo "Stack must be 'blue' or 'green'" >&2
  exit 1
fi

target_weight() {
  local target=$1
  local weight=$2
  echo "{"\"TargetGroupArn\":\"$target\",\"Weight\":$weight}""
}

update_alb_weights() {
  local shift_to=$1
  local percentage=$2
  local blue_weight green_weight
  if [[ "$shift_to" == "blue" ]]; then
    blue_weight=$percentage
    green_weight=$((100 - percentage))
  else
    green_weight=$percentage
    blue_weight=$((100 - percentage))
  fi

  echo "Updating ALB listener rule weights: blue=${blue_weight} green=${green_weight}"
  aws elbv2 modify-listener \
    --listener-arn "$ALB_LISTENER_ARN" \
    --default-actions Type=forward,ForwardConfig="{\"TargetGroups\":[{\"TargetGroupArn\":\"$BLUE_TG_ARN\",\"Weight\":$blue_weight},{\"TargetGroupArn\":\"$GREEN_TG_ARN\",\"Weight\":$green_weight}],\"TargetGroupStickinessConfig\":{\"Enabled\":false}}" \
    >/dev/null
}

update_cloudfront_weights() {
  if [[ -z "$CLOUDFRONT_DIST_ID" ]]; then
    echo "CLOUDFRONT_DIST_ID not set; skipping CloudFront weight update"
    return
  fi

  local shift_to=$1
  local percentage=$2
  local origin_blue="toron-blue"
  local origin_green="toron-green"
  local blue_weight green_weight

  if [[ "$shift_to" == "blue" ]]; then
    blue_weight=$percentage
    green_weight=$((100 - percentage))
  else
    green_weight=$percentage
    blue_weight=$((100 - percentage))
  fi

  echo "Updating CloudFront origin weights: blue=${blue_weight} green=${green_weight}"
  local dist=$(aws cloudfront get-distribution-config --id "$CLOUDFRONT_DIST_ID")
  local etag=$(echo "$dist" | jq -r .ETag)
  local config=$(echo "$dist" | jq \
    --argjson blue $blue_weight --argjson green $green_weight \
    '.DistributionConfig | .Origins.Items |= map(if .Id=="'"${origin_blue}'"" then .Weight=$blue else . end) | .Origins.Items |= map(if .Id=="'"${origin_green}'"" then .Weight=$green else . end)')

  aws cloudfront update-distribution \
    --id "$CLOUDFRONT_DIST_ID" \
    --if-match "$etag" \
    --distribution-config "$config" >/dev/null
}

update_route53_weights() {
  if [[ -z "$ROUTE53_ZONE_ID" || -z "$ROUTE53_RECORD_NAME" ]]; then
    echo "Route53 variables not set; skipping DNS weight update"
    return
  fi

  local shift_to=$1
  local percentage=$2
  local blue_weight green_weight
  if [[ "$shift_to" == "blue" ]]; then
    blue_weight=$percentage
    green_weight=$((100 - percentage))
  else
    green_weight=$percentage
    blue_weight=$((100 - percentage))
  fi

  echo "Updating Route53 weighted record: blue=${blue_weight} green=${green_weight}"
  aws route53 change-resource-record-sets --hosted-zone-id "$ROUTE53_ZONE_ID" --change-batch "$(cat <<JSON
{
  "Comment": "Shift traffic to $shift_to",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$ROUTE53_RECORD_NAME",
        "Type": "A",
        "SetIdentifier": "toron-blue",
        "Weight": $blue_weight,
        "AliasTarget": {
          "HostedZoneId": "${ALB_HOSTED_ZONE_ID:-Z35SXDOTRQ7X7K}",
          "DNSName": "${ALB_DNS_NAME:-example-alb.amazonaws.com}",
          "EvaluateTargetHealth": true
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$ROUTE53_RECORD_NAME",
        "Type": "A",
        "SetIdentifier": "toron-green",
        "Weight": $green_weight,
        "AliasTarget": {
          "HostedZoneId": "${ALB_HOSTED_ZONE_ID:-Z35SXDOTRQ7X7K}",
          "DNSName": "${ALB_DNS_NAME:-example-alb.amazonaws.com}",
          "EvaluateTargetHealth": true
        }
      }
    }
  ]
}
JSON
)" >/dev/null
}

main() {
  echo "Starting traffic shift to $STACK at ${PERCENTAGE}%"
  update_alb_weights "$STACK" "$PERCENTAGE"
  update_cloudfront_weights "$STACK" "$PERCENTAGE"
  update_route53_weights "$STACK" "$PERCENTAGE"
  echo "Traffic shift complete"
}

main "$@"
