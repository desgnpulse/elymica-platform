#!/bin/bash

# Environment Variable Validation Script
# Run before production deployments

set -e

echo "🔍 Environment Variable Validation"
echo "==================================="
echo ""

# Check required variables
REQUIRED_VARS=(
  "NEXT_PUBLIC_API_BASE_URL"
  "NEXT_PUBLIC_AUTH_ENABLED"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  else
    echo "✅ $var: ${!var}"
  fi
done

echo ""

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "❌ Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  exit 1
fi

# Validate API URL format
if [[ ! "$NEXT_PUBLIC_API_BASE_URL" =~ ^https?:// ]]; then
  echo "❌ NEXT_PUBLIC_API_BASE_URL must start with http:// or https://"
  exit 1
fi

echo "✅ All environment variables valid!"
