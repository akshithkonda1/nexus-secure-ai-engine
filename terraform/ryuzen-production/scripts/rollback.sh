#!/bin/bash
#############################
# Ryuzen Production Rollback Script
#############################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"
TARGET_STATE="${2:-}"

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

show_usage() {
    echo "Usage: $0 <environment> [state-version]"
    echo ""
    echo "Arguments:"
    echo "  environment   - production, staging, dev, gov-cloud"
    echo "  state-version - Optional: specific state version to rollback to"
    echo ""
    echo "Examples:"
    echo "  $0 production              # List available states"
    echo "  $0 production 5            # Rollback to version 5"
}

list_state_versions() {
    log_info "Listing available state versions..."

    aws s3api list-object-versions \
        --bucket "ryuzen-terraform-state" \
        --prefix "ryuzen-$ENVIRONMENT/terraform.tfstate" \
        --query 'Versions[*].[VersionId,LastModified,Size]' \
        --output table
}

rollback_to_version() {
    local version=$1

    log_warn "Rolling back to state version: $version"
    log_warn "This is a destructive operation!"

    read -p "Type 'rollback' to confirm: " confirm
    if [[ "$confirm" != "rollback" ]]; then
        log_error "Rollback cancelled"
        exit 1
    fi

    # Download the specific version
    aws s3api get-object \
        --bucket "ryuzen-terraform-state" \
        --key "ryuzen-$ENVIRONMENT/terraform.tfstate" \
        --version-id "$version" \
        "terraform.tfstate.rollback"

    log_info "State downloaded. Run terraform plan to review changes."
}

main() {
    if [[ -z "$TARGET_STATE" ]]; then
        list_state_versions
    else
        rollback_to_version "$TARGET_STATE"
    fi
}

main
