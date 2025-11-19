# Cloudflare Pages Deployment Guide

**Platform**: Cloudflare Pages + Workers
**Cost**: Free tier (unlimited bandwidth)
**African Coverage**: Lagos, Nairobi, Johannesburg, Cairo

---

## Why Cloudflare for Elymica

1. **Best African Coverage**: Edge nodes in Lagos 🇳🇬, Nairobi 🇰🇪, Johannesburg 🇿🇦, Cairo 🇪🇬
2. **Free Unlimited Bandwidth**: No bandwidth overage charges (critical for African market)
3. **Low Latency**: 20-50ms for Nigerian/Kenyan users (vs 150-200ms on Vercel)
4. **Zero Cold Starts**: Workers run at the edge instantly
5. **Cost Effective**: Free for MVP stage, scales affordably

---

## Prerequisites

- GitHub repository with Elymica monorepo
- Cloudflare account (free tier)
- Node.js 18+ installed locally
- pnpm package manager

---

## Option 1: Cloudflare Dashboard (Easiest)

### Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Create free account
3. Navigate to **Pages** in left sidebar

### Step 2: Connect GitHub

1. Click **Create a project**
2. Click **Connect to Git**
3. Authorize Cloudflare to access your GitHub repository
4. Select `elymica-platform` repository

### Step 3: Configure Student Portal

**Build Configuration**:
```
Project Name: elymica-student-portal
Production Branch: main
Build Command: cd ../.. && pnpm install && pnpm --filter student-portal build
Build Output Directory: apps/student-portal/.next
Root Directory: (leave empty)
```

**Environment Variables**:
```
NEXT_PUBLIC_API_BASE_URL = https://api.elymica.com
NEXT_PUBLIC_AUTH_ENABLED = true
NEXT_PUBLIC_ENABLE_ANALYTICS = true
NODE_VERSION = 18
```

**Advanced Settings**:
```
Build Watch Paths: apps/student-portal/**, packages/**
Install Command: pnpm install
```

### Step 4: Deploy

1. Click **Save and Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL: `https://elymica-student-portal.pages.dev`

### Step 5: Repeat for Other Portals

**Parent Portal**:
```
Project Name: elymica-parent-portal
Build Command: cd ../.. && pnpm install && pnpm --filter parent-portal build
Build Output Directory: apps/parent-portal/.next
```

**Teacher Portal**:
```
Project Name: elymica-teacher-portal
Build Command: cd ../.. && pnpm install && pnpm --filter teacher-portal build
Build Output Directory: apps/teacher-portal/.next
```

---

## Option 2: Wrangler CLI (Recommended for CI/CD)

### Step 1: Install Wrangler

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Step 2: Create Configuration Files

Create `wrangler.toml` in each portal directory:

```bash
# apps/student-portal/wrangler.toml
```

```toml
name = "elymica-student-portal"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[env.production]
vars = {
  NEXT_PUBLIC_API_BASE_URL = "https://api.elymica.com",
  NEXT_PUBLIC_AUTH_ENABLED = "true"
}

[env.preview]
vars = {
  NEXT_PUBLIC_API_BASE_URL = "https://api-staging.elymica.com",
  NEXT_PUBLIC_AUTH_ENABLED = "false"
}
```

```bash
# apps/parent-portal/wrangler.toml
```

```toml
name = "elymica-parent-portal"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[env.production]
vars = {
  NEXT_PUBLIC_API_BASE_URL = "https://api.elymica.com",
  NEXT_PUBLIC_AUTH_ENABLED = "true"
}
```

```bash
# apps/teacher-portal/wrangler.toml
```

```toml
name = "elymica-teacher-portal"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[env.production]
vars = {
  NEXT_PUBLIC_API_BASE_URL = "https://api.elymica.com",
  NEXT_PUBLIC_AUTH_ENABLED = "true"
}
```

### Step 3: Create Deployment Script

```bash
# scripts/deploy-cloudflare.sh
```

```bash
#!/bin/bash

# Deploy all portals to Cloudflare Pages

set -e

echo "🚀 Deploying Elymica Platform to Cloudflare Pages"
echo "================================================"
echo ""

PORTALS=("student-portal" "parent-portal" "teacher-portal")

# Build all portals
echo "🔨 Building all portals..."
for portal in "${PORTALS[@]}"; do
  echo "Building $portal..."
  pnpm --filter "$portal" build
done

echo ""
echo "📦 Deploying to Cloudflare..."
echo ""

# Deploy each portal
for portal in "${PORTALS[@]}"; do
  echo "Deploying $portal..."
  cd "apps/$portal"
  wrangler pages deploy .next --project-name="elymica-$portal"
  cd ../..
  echo "✅ $portal deployed!"
  echo ""
done

echo "🎉 All portals deployed successfully!"
echo ""
echo "Production URLs:"
echo "  Student: https://elymica-student-portal.pages.dev"
echo "  Parent:  https://elymica-parent-portal.pages.dev"
echo "  Teacher: https://elymica-teacher-portal.pages.dev"
```

### Step 4: Deploy

```bash
chmod +x scripts/deploy-cloudflare.sh
./scripts/deploy-cloudflare.sh
```

---

## Custom Domains

### Step 1: Add Domain to Cloudflare

1. Go to **Cloudflare Dashboard** → **Websites**
2. Click **Add a Site**
3. Enter `elymica.com`
4. Follow nameserver setup (update at your domain registrar)

### Step 2: Configure Subdomains

1. Go to **Pages** → Select your project
2. Click **Custom domains** tab
3. Click **Set up a custom domain**

**Student Portal**:
```
Domain: student.elymica.com
```

**Parent Portal**:
```
Domain: parent.elymica.com
```

**Teacher Portal**:
```
Domain: teacher.elymica.com
```

Cloudflare automatically provisions SSL certificates (within minutes).

---

## Environment Variables Management

### Production Variables

1. Go to **Pages** → Select project → **Settings** → **Environment variables**
2. Add variables:

```
NEXT_PUBLIC_API_BASE_URL = https://api.elymica.com
NEXT_PUBLIC_AUTH_ENABLED = true
NEXT_PUBLIC_ENABLE_ANALYTICS = true
NEXT_PUBLIC_SENTRY_DSN = <your-sentry-dsn>
```

### Preview Variables (for staging branches)

Add separate values for preview deployments:

```
NEXT_PUBLIC_API_BASE_URL = https://api-staging.elymica.com
NEXT_PUBLIC_AUTH_ENABLED = false
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
      - staging
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build Student Portal
        run: pnpm --filter student-portal build

      - name: Deploy Student Portal to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: elymica-student-portal
          directory: apps/student-portal/.next
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Build Parent Portal
        run: pnpm --filter parent-portal build

      - name: Deploy Parent Portal to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: elymica-parent-portal
          directory: apps/parent-portal/.next
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Build Teacher Portal
        run: pnpm --filter teacher-portal build

      - name: Deploy Teacher Portal to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: elymica-teacher-portal
          directory: apps/teacher-portal/.next
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### GitHub Secrets Setup

Add these secrets to your GitHub repository (**Settings** → **Secrets and variables** → **Actions**):

1. `CLOUDFLARE_API_TOKEN`:
   - Go to Cloudflare Dashboard → **My Profile** → **API Tokens**
   - Create token with **Cloudflare Pages - Edit** permissions

2. `CLOUDFLARE_ACCOUNT_ID`:
   - Go to Cloudflare Dashboard → **Pages** → Any project
   - Copy Account ID from URL: `dash.cloudflare.com/{ACCOUNT_ID}/pages`

---

## Next.js Adapter for Cloudflare

Cloudflare requires a special adapter for Next.js App Router features.

### Option A: Use @cloudflare/next-on-pages

```bash
pnpm add -D @cloudflare/next-on-pages
```

Update `next.config.mjs`:

```javascript
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
}

export default nextConfig
```

Update build command:

```bash
# package.json
{
  "scripts": {
    "build": "npx @cloudflare/next-on-pages"
  }
}
```

### Option B: Use Static Export (Simplest)

If you don't need server-side features:

```javascript
// next.config.mjs
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Cloudflare doesn't support Next.js Image Optimization
  },
}
```

**Note**: This disables SSR, API routes, and dynamic features.

---

## Handling Next.js Server Features

### Serverless Functions → Workers

Replace Next.js API routes with Cloudflare Workers:

```typescript
// functions/api/hello.ts
export async function onRequest(context) {
  return new Response(JSON.stringify({ message: 'Hello from Cloudflare Workers!' }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### Image Optimization → Cloudflare Images

Replace `next/image` with Cloudflare Images:

```bash
# Enable Cloudflare Images in dashboard
# Then use Cloudflare Image Resizing URLs
```

```tsx
// Before (Next.js)
<Image src="/photo.jpg" width={500} height={300} alt="Photo" />

// After (Cloudflare)
<img
  src="https://elymica.com/cdn-cgi/image/width=500,height=300/photo.jpg"
  alt="Photo"
/>
```

---

## Performance Optimization

### Cache Configuration

Create `_headers` file in `public/` directory:

```
# Cache static assets for 1 year
/static/*
  Cache-Control: public, max-age=31536000, immutable

# Cache images for 1 month
/*.jpg
  Cache-Control: public, max-age=2592000

/*.png
  Cache-Control: public, max-age=2592000

/*.webp
  Cache-Control: public, max-age=2592000

# Don't cache HTML
/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

### Edge Caching Rules

In Cloudflare Dashboard → **Caching** → **Configuration**:

```
Cache Level: Standard
Browser Cache TTL: Respect Existing Headers
Always Online: On
Development Mode: Off (in production)
```

---

## Monitoring & Analytics

### Enable Cloudflare Analytics

1. Go to **Pages** → Select project → **Analytics**
2. View:
   - Page views
   - Unique visitors
   - Top pages
   - Geographic distribution
   - Performance metrics

### Web Analytics (Privacy-friendly)

1. Go to **Analytics** → **Web Analytics**
2. Click **Add a site**
3. Copy the tracking code
4. Add to your `app/layout.tsx`:

```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script
          defer
          src='https://static.cloudflareinsights.com/beacon.min.js'
          data-cf-beacon='{"token": "YOUR_TOKEN"}'
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## Troubleshooting

### Build Fails: "pnpm not found"

Add to environment variables:
```
PNPM_VERSION = 8
```

Or use explicit install:
```bash
# In build command
npm install -g pnpm@8 && pnpm install && pnpm build
```

### Build Fails: "Cannot find module @elymica/ui"

Cloudflare doesn't automatically resolve workspace dependencies. Use explicit build command:

```bash
cd ../.. && pnpm install && pnpm --filter student-portal build
```

### "Module not found" in Production

Ensure `transpilePackages` in `next.config.mjs`:

```javascript
const nextConfig = {
  transpilePackages: [
    '@elymica/tokens',
    '@elymica/ui',
    '@elymica/api-client',
    '@elymica/hooks',
    '@elymica/config',
  ],
}
```

### Slow Build Times

Enable build caching:
1. Go to **Settings** → **Builds & deployments**
2. Enable **Build cache**
3. Builds will be 2-3x faster after first deploy

---

## Cost Estimate

**Free Tier Includes**:
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 100 custom domains
- 1 concurrent build

**If You Exceed Free Tier**:
- Pro Plan: $20/month
  - 5,000 builds/month
  - 5 concurrent builds
  - Advanced analytics

**For Elymica**: Free tier is sufficient for MVP stage (10K+ users).

---

## Migration Checklist

- [ ] Create Cloudflare account
- [ ] Connect GitHub repository
- [ ] Configure build settings for 3 portals
- [ ] Add environment variables
- [ ] Deploy student portal (test)
- [ ] Deploy parent portal
- [ ] Deploy teacher portal
- [ ] Test all portals from Lagos/Nairobi
- [ ] Run Lighthouse audits on Cloudflare URLs
- [ ] Compare latency vs Vercel
- [ ] Set up custom domains
- [ ] Configure GitHub Actions CI/CD
- [ ] Enable Cloudflare Analytics
- [ ] Update documentation with production URLs

---

## Next Steps

1. **This Week**: Deploy to Cloudflare Pages free tier
2. **Run Tests**: Test from Nigeria, Kenya, South Africa
3. **Measure Performance**: Lighthouse audits, latency tests
4. **Compare**: Cloudflare vs Vercel performance
5. **Decide**: Final platform selection
6. **Document**: Update production deployment guide

---

**Estimated Setup Time**: 2-4 hours (all 3 portals)
**Estimated Cost**: $0/month (free tier)
**African Latency**: 20-50ms (excellent)

**Recommended**: Start here for MVP, migrate to AWS if scale demands it.
