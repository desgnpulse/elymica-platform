#!/bin/bash

# Test Cloudflare Pages Latency
# Checks which data center serves your deployment and measures TTFB

set -e

echo "🌍 Cloudflare Pages Latency Test"
echo "================================="
echo ""

# Check if URL provided
if [ -z "$1" ]; then
  echo "Usage: ./test-cloudflare-latency.sh <url>"
  echo ""
  echo "Examples:"
  echo "  ./test-cloudflare-latency.sh https://elymica-student-portal.pages.dev"
  echo "  ./test-cloudflare-latency.sh https://student.elymica.com"
  exit 1
fi

URL=$1

echo "Testing: $URL"
echo ""

# Test basic connectivity
echo "1️⃣ Testing Basic Connectivity..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Site is reachable (HTTP $HTTP_CODE)"
else
  echo "❌ Site returned HTTP $HTTP_CODE"
  exit 1
fi

echo ""

# Get Cloudflare trace info
echo "2️⃣ Cloudflare Edge Location..."
TRACE=$(curl -s "${URL}/cdn-cgi/trace")

if [ $? -eq 0 ]; then
  # Extract key fields
  COLO=$(echo "$TRACE" | grep "colo=" | cut -d= -f2)
  LOC=$(echo "$TRACE" | grep "^loc=" | cut -d= -f2)
  COUNTRY=$(echo "$TRACE" | grep "^loc=" | cut -d= -f2)

  # Map COLO codes to cities
  case $COLO in
    LOS) CITY="Lagos, Nigeria 🇳🇬" ;;
    NBO) CITY="Nairobi, Kenya 🇰🇪" ;;
    JNB) CITY="Johannesburg, South Africa 🇿🇦" ;;
    CPT) CITY="Cape Town, South Africa 🇿🇦" ;;
    CAI) CITY="Cairo, Egypt 🇪🇬" ;;
    MBA) CITY="Mombasa, Kenya 🇰🇪" ;;
    KGL) CITY="Kigali, Rwanda 🇷🇼" ;;
    DUR) CITY="Durban, South Africa 🇿🇦" ;;
    *) CITY="$COLO" ;;
  esac

  echo "  Edge Location: $CITY"
  echo "  Country Code: $LOC"
  echo "  Data Center: $COLO"
else
  echo "⚠️  Could not fetch Cloudflare trace (not a Cloudflare Pages site?)"
fi

echo ""

# Measure Time to First Byte (TTFB)
echo "3️⃣ Measuring Performance..."
echo ""

# Run 5 tests and calculate average
TOTAL_TIME=0
MIN_TIME=999999
MAX_TIME=0

for i in {1..5}; do
  TTFB=$(curl -o /dev/null -s -w '%{time_starttransfer}\n' "$URL")
  TTFB_MS=$(echo "$TTFB * 1000" | bc | cut -d. -f1)

  echo "  Test $i: ${TTFB_MS}ms"

  TOTAL_TIME=$((TOTAL_TIME + TTFB_MS))

  if [ "$TTFB_MS" -lt "$MIN_TIME" ]; then
    MIN_TIME=$TTFB_MS
  fi

  if [ "$TTFB_MS" -gt "$MAX_TIME" ]; then
    MAX_TIME=$TTFB_MS
  fi

  sleep 0.5
done

AVG_TIME=$((TOTAL_TIME / 5))

echo ""
echo "📊 Results:"
echo "  Average TTFB: ${AVG_TIME}ms"
echo "  Min TTFB: ${MIN_TIME}ms"
echo "  Max TTFB: ${MAX_TIME}ms"
echo ""

# Performance evaluation
if [ "$AVG_TIME" -lt 100 ]; then
  echo "🎉 Excellent! Your site is lightning fast."
elif [ "$AVG_TIME" -lt 200 ]; then
  echo "✅ Good performance for the target market."
elif [ "$AVG_TIME" -lt 500 ]; then
  echo "⚠️  Acceptable, but could be optimized."
else
  echo "❌ Slow performance. Consider optimizations."
fi

echo ""

# Full request breakdown
echo "4️⃣ Detailed Timing Breakdown..."
curl -o /dev/null -s -w "\
  DNS Lookup:        %{time_namelookup}s\n\
  TCP Connect:       %{time_connect}s\n\
  TLS Handshake:     %{time_appconnect}s\n\
  Server Processing: %{time_starttransfer}s\n\
  Content Transfer:  %{time_total}s\n\
  Total Time:        %{time_total}s\n" "$URL"

echo ""
echo "✅ Test complete!"
echo ""
echo "💡 Tips:"
echo "  - TTFB < 100ms: Excellent for African users"
echo "  - TTFB 100-200ms: Good"
echo "  - TTFB > 200ms: Consider edge caching optimizations"
