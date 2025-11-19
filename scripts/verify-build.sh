#!/bin/bash

# Production Build Verification Script
# Ensures all portals build successfully with no errors

set -e

echo "🔨 Production Build Verification"
echo "================================="
echo ""

PORTALS=("student-portal" "parent-portal" "teacher-portal")
BUILD_ERRORS=()

for portal in "${PORTALS[@]}"; do
  echo "Building $portal..."

  if pnpm --filter "$portal" build 2>&1 | tee "build-${portal}.log"; then
    echo "✅ $portal built successfully"

    # Check for .next directory
    if [ ! -d "apps/$portal/.next" ]; then
      echo "❌ $portal: .next directory not found"
      BUILD_ERRORS+=("$portal: .next missing")
    fi

    # Check for static directory
    if [ ! -d "apps/$portal/.next/static" ]; then
      echo "⚠️  $portal: .next/static directory not found"
    fi

    # Check build size
    BUILD_SIZE=$(du -sh "apps/$portal/.next" | cut -f1)
    echo "  Build size: $BUILD_SIZE"

  else
    echo "❌ $portal build failed"
    BUILD_ERRORS+=("$portal: build failed")
  fi

  echo ""
done

echo "================================="

if [ ${#BUILD_ERRORS[@]} -gt 0 ]; then
  echo "❌ Build verification failed:"
  for error in "${BUILD_ERRORS[@]}"; do
    echo "  - $error"
  done
  exit 1
fi

echo "✅ All portals built successfully!"
echo ""
echo "📊 Build artifacts:"
for portal in "${PORTALS[@]}"; do
  echo "  $portal:"
  echo "    .next: apps/$portal/.next"
  echo "    Size: $(du -sh "apps/$portal/.next" | cut -f1)"
done
