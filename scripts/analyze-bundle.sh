#!/bin/bash

# Bundle Size Analysis Script
# Analyzes production build bundle sizes for all portals

set -e

echo "📦 Bundle Size Analysis"
echo "======================="
echo ""

# Define portals
PORTALS=("student-portal" "parent-portal" "teacher-portal")

# Build all portals
echo "🔨 Building all portals in production mode..."
echo ""

for portal in "${PORTALS[@]}"; do
    echo "Building $portal..."
    cd "apps/$portal" && pnpm build && cd ../..
done

echo ""
echo "📊 Analyzing bundle sizes..."
echo ""

# Analyze each portal
for portal in "${PORTALS[@]}"; do
    echo "================================"
    echo "$portal"
    echo "================================"

    # Check if .next exists
    if [ -d "apps/$portal/.next" ]; then
        # Show bundle sizes
        echo ""
        echo "JavaScript Bundles:"
        find "apps/$portal/.next/static/chunks" -name "*.js" -type f -exec du -sh {} \; | sort -h | tail -10

        echo ""
        echo "CSS Bundles:"
        find "apps/$portal/.next/static/css" -name "*.css" -type f -exec du -sh {} \; 2>/dev/null || echo "  No CSS bundles found"

        echo ""
        echo "Total .next size:"
        du -sh "apps/$portal/.next"

        echo ""
    else
        echo "  ⚠️  Build directory not found"
    fi
done

echo ""
echo "💡 Tips for reducing bundle size:"
echo "  1. Use dynamic imports for heavy components"
echo "  2. Remove unused dependencies"
echo "  3. Enable tree shaking"
echo "  4. Use next/image for automatic optimization"
echo "  5. Split large components into smaller modules"
echo ""

# Check for large dependencies
echo "📦 Checking for large dependencies..."
echo ""

for portal in "${PORTALS[@]}"; do
    echo "$portal dependencies:"
    cd "apps/$portal"
    npx package-size | head -20 || echo "  (package-size not available)"
    cd ../..
    echo ""
done

echo "✅ Analysis complete!"
