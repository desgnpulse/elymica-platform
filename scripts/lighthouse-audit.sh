#!/bin/bash

# Lighthouse Performance Audit Script
# Run this after starting dev servers to generate performance reports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Elymica Platform - Lighthouse Audit"
echo "========================================"
echo ""

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo -e "${YELLOW}⚠️  Lighthouse CLI not found. Installing...${NC}"
    npm install -g lighthouse
fi

# Create reports directory
REPORTS_DIR="./lighthouse-reports"
mkdir -p "$REPORTS_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "📊 Running audits (this may take 2-3 minutes)..."
echo ""

# Define portals to audit
declare -A PORTALS=(
    ["student"]="http://localhost:3000"
    ["parent"]="http://localhost:3001"
    ["teacher"]="http://localhost:3002"
)

# Run audits for each portal
for portal in "${!PORTALS[@]}"; do
    url="${PORTALS[$portal]}"

    echo -e "${YELLOW}🚀 Auditing ${portal} portal at ${url}...${NC}"

    # Run Lighthouse audit
    lighthouse "$url" \
        --output=html \
        --output=json \
        --output-path="${REPORTS_DIR}/${portal}-${TIMESTAMP}" \
        --chrome-flags="--headless --no-sandbox" \
        --only-categories=performance,accessibility,best-practices,seo \
        --quiet

    # Extract scores from JSON
    if [ -f "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json" ]; then
        performance=$(jq -r '.categories.performance.score * 100' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")
        accessibility=$(jq -r '.categories.accessibility.score * 100' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")
        bestPractices=$(jq -r '.categories["best-practices"].score * 100' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")
        seo=$(jq -r '.categories.seo.score * 100' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")

        echo -e "  Performance:     ${GREEN}${performance}${NC}"
        echo -e "  Accessibility:   ${GREEN}${accessibility}${NC}"
        echo -e "  Best Practices:  ${GREEN}${bestPractices}${NC}"
        echo -e "  SEO:             ${GREEN}${seo}${NC}"
        echo ""
    fi
done

echo -e "${GREEN}✅ Audit complete!${NC}"
echo ""
echo "📁 Reports saved to: ${REPORTS_DIR}/"
echo ""
echo "📖 Open HTML reports:"
for portal in "${!PORTALS[@]}"; do
    echo "  ${portal}: ${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.html"
done
echo ""

# Generate summary
echo "📋 Generating summary..."
echo "========================" > "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
echo "Lighthouse Audit Summary" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
echo "Date: $(date)" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
echo "========================" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
echo "" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"

for portal in "${!PORTALS[@]}"; do
    if [ -f "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json" ]; then
        echo "${portal} Portal:" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "  Performance: $(jq -r '.categories.performance.score * 100' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "  Accessibility: $(jq -r '.categories.accessibility.score * 100' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "  Best Practices: $(jq -r '.categories["best-practices"].score * 100' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "  SEO: $(jq -r '.categories.seo.score * 100' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"

        # Extract key metrics
        echo "" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "  Key Metrics:" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "    FCP: $(jq -r '.audits["first-contentful-paint"].displayValue' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "    LCP: $(jq -r '.audits["largest-contentful-paint"].displayValue' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "    TBT: $(jq -r '.audits["total-blocking-time"].displayValue' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.txt")" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "    CLS: $(jq -r '.audits["cumulative-layout-shift"].displayValue' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "    SI: $(jq -r '.audits["speed-index"].displayValue' "${REPORTS_DIR}/${portal}-${TIMESTAMP}.report.json")" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
        echo "" >> "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"
    fi
done

cat "${REPORTS_DIR}/summary-${TIMESTAMP}.txt"

echo -e "${GREEN}🎉 Audit complete! Check the reports directory for details.${NC}"
