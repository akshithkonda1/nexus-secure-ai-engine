#!/bin/bash
#############################
# Ryuzen Production Deployment Script
#############################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

validate_environment() {
    if [[ ! "$ENVIRONMENT" =~ ^(production|staging|dev|gov-cloud)$ ]]; then
        log_error "Invalid environment: $ENVIRONMENT"
        log_error "Valid options: production, staging, dev, gov-cloud"
        exit 1
    fi
    log_info "Deploying to: $ENVIRONMENT"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v terraform &> /dev/null; then
        log_error "Terraform is not installed"
        exit 1
    fi

    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured"
        exit 1
    fi

    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    log_info "AWS Account: $AWS_ACCOUNT"

    # Check Terraform version
    TF_VERSION=$(terraform version -json | jq -r '.terraform_version')
    log_info "Terraform version: $TF_VERSION"
}

init_terraform() {
    log_info "Initializing Terraform..."
    cd "$ROOT_DIR"

    terraform init \
        -backend-config="key=ryuzen-$ENVIRONMENT/terraform.tfstate" \
        -reconfigure
}

validate_terraform() {
    log_info "Validating Terraform configuration..."
    terraform validate
}

plan_deployment() {
    log_info "Planning deployment..."

    terraform plan \
        -var-file="environments/$ENVIRONMENT.tfvars" \
        -var="aws_account_id=$AWS_ACCOUNT" \
        -out="tfplan-$ENVIRONMENT.out"

    log_info "Plan saved to: tfplan-$ENVIRONMENT.out"
}

apply_deployment() {
    log_info "Applying deployment..."

    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_warn "Production deployment - requiring confirmation..."
        read -p "Type 'yes' to confirm production deployment: " confirm
        if [[ "$confirm" != "yes" ]]; then
            log_error "Deployment cancelled"
            exit 1
        fi
    fi

    terraform apply "tfplan-$ENVIRONMENT.out"

    log_info "Deployment complete!"
}

output_info() {
    log_info "Deployment outputs:"
    terraform output -json > "outputs-$ENVIRONMENT.json"

    API_ENDPOINT=$(terraform output -raw api_endpoint 2>/dev/null || echo "N/A")
    log_info "API Endpoint: $API_ENDPOINT"
}

main() {
    log_info "========================================="
    log_info "Ryuzen Infrastructure Deployment"
    log_info "========================================="

    validate_environment
    check_prerequisites
    init_terraform
    validate_terraform
    plan_deployment
    apply_deployment
    output_info

    log_info "========================================="
    log_info "Deployment completed successfully!"
    log_info "========================================="
}

main
