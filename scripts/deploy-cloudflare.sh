#!/bin/bash

# Deploy all portals to Cloudflare Pages
# Requires: wrangler CLI installed and authenticated

set -e

echo "🚀 Deploying Elymica Platform to Cloudflare Pages"
echo "=================================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if user is authenticated
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not authenticated with Cloudflare"
    echo "Run: wrangler login"
    exit 1
fi

PORTALS=("student-portal" "parent-portal" "teacher-portal")

# Build all portals
echo "🔨 Building all portals..."
for portal in "${PORTALS[@]}"; do
  echo "Building $portal..."
  pnpm --filter "$portal" build
  if [ $? -ne 0 ]; then
    echo "❌ Build failed for $portal"
    exit 1
  fi
  echo "✅ $portal built successfully"
done

echo ""
echo "📦 Deploying to Cloudflare Pages..."
echo ""

# Deploy each portal
for portal in "${PORTALS[@]}"; do
  echo "Deploying $portal..."

  cd "apps/$portal"

  # Deploy to Cloudflare Pages
  wrangler pages deploy .next \
    --project-name="elymica-$portal" \
    --branch=main \
    --commit-dirty=true

  if [ $? -eq 0 ]; then
    echo "✅ $portal deployed successfully!"
  else
    echo "❌ Deployment failed for $portal"
    cd ../..
    exit 1
  fi

  cd ../..
  echo ""
done

echo "🎉 All portals deployed successfully!"
echo ""
echo "📍 Production URLs:"
echo "  Student: https://elymica-student-portal.pages.dev"
echo "  Parent:  https://elymica-parent-portal.pages.dev"
echo "  Teacher: https://elymica-teacher-portal.pages.dev"
echo ""
echo "💡 Next steps:"
echo "  1. Test each portal from target markets"
echo "  2. Run Lighthouse audits"
echo "  3. Configure custom domains (student.elymica.com, etc.)"
echo "  4. Set up GitHub Actions for automated deployments"
