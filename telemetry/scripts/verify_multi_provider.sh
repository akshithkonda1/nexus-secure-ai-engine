#!/bin/bash
# Multi-Provider Telemetry Deployment Verification Script
# Checks all prerequisites and deployment readiness

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Status tracking
CHECKS_PASSED=0
CHECKS_FAILED=0

print_header() {
    echo ""
    echo "========================================="
    echo "$1"
    echo "========================================="
}

print_check() {
    echo -n "Checking $1... "
}

print_pass() {
    echo -e "${GREEN}✅ PASS${NC}"
    ((CHECKS_PASSED++))
}

print_fail() {
    echo -e "${RED}❌ FAIL${NC}"
    ((CHECKS_FAILED++))
    if [ -n "$1" ]; then
        echo -e "${RED}   Error: $1${NC}"
    fi
}

print_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}"
    if [ -n "$1" ]; then
        echo -e "${YELLOW}   Warning: $1${NC}"
    fi
}

print_info() {
    echo -e "   ℹ️  $1"
}

# Main verification
print_header "Multi-Provider Telemetry Deployment Verification"

# Check 1: AWS Credentials
print_check "AWS credentials configuration"
if aws sts get-caller-identity &> /dev/null; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_pass
    print_info "Account ID: $ACCOUNT_ID"
else
    print_fail "AWS credentials not configured"
    print_info "Run: aws configure"
fi

# Check 2: AWS Region
print_check "AWS region configuration"
AWS_REGION=${AWS_REGION:-$(aws configure get region)}
if [ -n "$AWS_REGION" ]; then
    print_pass
    print_info "Region: $AWS_REGION"
else
    print_fail "AWS region not set"
    print_info "Run: export AWS_REGION=us-east-1"
fi

# Check 3: Secrets Manager - OpenAI
print_check "OpenAI API key in Secrets Manager"
if aws secretsmanager describe-secret --secret-id ryuzen/telemetry/openai-api-key --region ${AWS_REGION:-us-east-1} &> /dev/null; then
    print_pass
else
    print_fail "OpenAI API key secret not found"
    print_info "Create with: aws secretsmanager create-secret --name ryuzen/telemetry/openai-api-key --secret-string YOUR_KEY"
fi

# Check 4: Secrets Manager - Google
print_check "Google AI API key in Secrets Manager"
if aws secretsmanager describe-secret --secret-id ryuzen/telemetry/google-api-key --region ${AWS_REGION:-us-east-1} &> /dev/null; then
    print_pass
else
    print_fail "Google API key secret not found"
    print_info "Create with: aws secretsmanager create-secret --name ryuzen/telemetry/google-api-key --secret-string YOUR_KEY"
fi

# Check 5: Secrets Manager - Perplexity
print_check "Perplexity API key in Secrets Manager"
if aws secretsmanager describe-secret --secret-id ryuzen/telemetry/perplexity-api-key --region ${AWS_REGION:-us-east-1} &> /dev/null; then
    print_pass
else
    print_fail "Perplexity API key secret not found"
    print_info "Create with: aws secretsmanager create-secret --name ryuzen/telemetry/perplexity-api-key --secret-string YOUR_KEY"
fi

# Check 6: Bedrock Model Access
print_check "AWS Bedrock model access"
BEDROCK_MODELS_COUNT=$(aws bedrock list-foundation-models --region ${AWS_REGION:-us-east-1} 2>/dev/null | grep -c modelId || echo 0)
if [ "$BEDROCK_MODELS_COUNT" -gt 0 ]; then
    print_pass
    print_info "Found $BEDROCK_MODELS_COUNT Bedrock models"

    # Check specific models
    print_info "Checking specific model access..."

    REQUIRED_MODELS=(
        "anthropic.claude-sonnet-4-5"
        "anthropic.claude-opus-4"
        "cohere.command-r-plus"
        "meta.llama"
        "mistral.mistral-large"
    )

    for model_prefix in "${REQUIRED_MODELS[@]}"; do
        if aws bedrock list-foundation-models --region ${AWS_REGION:-us-east-1} 2>/dev/null | grep -q "$model_prefix"; then
            print_info "   ✓ $model_prefix models available"
        else
            print_warn "Model family $model_prefix not found"
            print_info "   Request access in AWS Console > Bedrock > Model access"
        fi
    done
else
    print_fail "No Bedrock models accessible"
    print_info "Enable model access in AWS Console > Bedrock > Model access"
fi

# Check 7: Python Dependencies
print_check "Python environment"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_pass
    print_info "Python version: $PYTHON_VERSION"

    # Check specific packages
    print_info "Checking required packages..."

    REQUIRED_PACKAGES=("boto3" "pandas" "anthropic" "openai" "google-generativeai" "requests")
    MISSING_PACKAGES=()

    for package in "${REQUIRED_PACKAGES[@]}"; do
        if python3 -c "import $package" 2>/dev/null; then
            VERSION=$(python3 -c "import $package; print($package.__version__)" 2>/dev/null || echo "unknown")
            print_info "   ✓ $package ($VERSION)"
        else
            print_warn "Package $package not installed"
            MISSING_PACKAGES+=("$package")
        fi
    done

    if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
        print_info "Install missing packages: pip install ${MISSING_PACKAGES[*]}"
    fi
else
    print_fail "Python 3 not found"
    print_info "Install Python 3.8 or higher"
fi

# Check 8: Model Routing Configuration
print_check "Model routing configuration file"
if [ -f "telemetry/bundles/model_routing_config.py" ] || [ -f "bundles/model_routing_config.py" ]; then
    print_pass

    # Count configured models
    if command -v python3 &> /dev/null; then
        MODEL_COUNT=$(python3 -c "
import sys
sys.path.insert(0, '.')
try:
    from telemetry.bundles.model_routing_config import list_supported_models
    models = list_supported_models()
    print(len(models))
except Exception as e:
    print(0)
" 2>/dev/null)

        if [ "$MODEL_COUNT" -ge 11 ]; then
            print_info "Configured models: $MODEL_COUNT"
        else
            print_warn "Expected 11 models, found $MODEL_COUNT"
        fi
    fi
else
    print_fail "model_routing_config.py not found"
    print_info "File should exist at telemetry/bundles/model_routing_config.py"
fi

# Check 9: Report Generator
print_check "Multi-provider report generator"
if [ -f "telemetry/bundles/report_generator.py" ] || [ -f "bundles/report_generator.py" ]; then
    # Check if it imports model routing
    if grep -q "from telemetry.bundles.model_routing_config import get_model_routing" "telemetry/bundles/report_generator.py" 2>/dev/null || \
       grep -q "from telemetry.bundles.model_routing_config import get_model_routing" "bundles/report_generator.py" 2>/dev/null; then
        print_pass
        print_info "Multi-provider support detected"
    else
        print_warn "Report generator may not have multi-provider support"
    fi
else
    print_fail "report_generator.py not found"
fi

# Check 10: IAM Permissions
print_check "IAM bundle task role permissions"
if aws iam get-role --role-name ryuzen-bundle-task-role --region ${AWS_REGION:-us-east-1} &> /dev/null; then
    # Get the policy ARN
    POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/ryuzen-bundle-task-policy"

    # Check if policy has Secrets Manager permissions
    if aws iam get-policy-version \
        --policy-arn "$POLICY_ARN" \
        --version-id $(aws iam get-policy --policy-arn "$POLICY_ARN" --query Policy.DefaultVersionId --output text) \
        2>/dev/null | grep -q "secretsmanager:GetSecretValue"; then
        print_pass
        print_info "Secrets Manager permissions: ✓"
    else
        print_fail "IAM policy missing Secrets Manager permissions"
        print_info "Run: cd telemetry/terraform && terraform apply"
    fi

    # Check Bedrock permissions
    if aws iam get-policy-version \
        --policy-arn "$POLICY_ARN" \
        --version-id $(aws iam get-policy --policy-arn "$POLICY_ARN" --query Policy.DefaultVersionId --output text) \
        2>/dev/null | grep -q "bedrock:InvokeModel"; then
        print_info "Bedrock invoke permissions: ✓"
    else
        print_warn "IAM policy may be missing Bedrock invoke permissions"
    fi
else
    print_warn "IAM role ryuzen-bundle-task-role not found (may not be deployed yet)"
fi

# Check 11: Terraform State
print_check "Terraform configuration"
if [ -f "telemetry/terraform/iam_roles.tf" ] || [ -f "terraform/iam_roles.tf" ]; then
    # Check if IAM roles.tf has the new statements
    if grep -q "ReadAPIKeysFromSecretsManager" "telemetry/terraform/iam_roles.tf" 2>/dev/null || \
       grep -q "ReadAPIKeysFromSecretsManager" "terraform/iam_roles.tf" 2>/dev/null; then
        print_pass
        print_info "Terraform files updated with new IAM permissions"
    else
        print_fail "Terraform IAM roles not updated"
        print_info "Update telemetry/terraform/iam_roles.tf with Secrets Manager and Bedrock permissions"
    fi
else
    print_warn "Terraform configuration not found"
fi

# Check 12: Docker/Container
print_check "Docker installation"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    print_pass
    print_info "Docker version: $DOCKER_VERSION"
else
    print_warn "Docker not installed (required for container deployment)"
fi

# Summary
print_header "Verification Summary"

echo ""
echo "Total checks passed: ${GREEN}$CHECKS_PASSED${NC}"
echo "Total checks failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review telemetry/MULTI_PROVIDER_DEPLOYMENT.md"
    echo "2. Deploy Terraform changes: cd telemetry/terraform && terraform apply"
    echo "3. Rebuild and deploy container"
    echo "4. Test bundle generation"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please resolve issues before deployment.${NC}"
    echo ""
    echo "Review the errors above and:"
    echo "1. Fix failed checks"
    echo "2. Re-run this verification script"
    echo "3. Consult telemetry/MULTI_PROVIDER_DEPLOYMENT.md for detailed instructions"
    exit 1
fi
