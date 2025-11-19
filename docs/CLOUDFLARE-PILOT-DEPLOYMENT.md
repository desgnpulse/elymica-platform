# Cloudflare Pages Pilot Deployment Guide

**Objective**: Deploy student portal first, validate performance, then roll out parent/teacher portals.

---

## Phase 1: Student Portal Pilot

### Pre-Flight Checklist

- [ ] Cloudflare account created (free tier)
- [ ] GitHub repository accessible
- [ ] Environment variables documented
- [ ] Build tested locally (`pnpm --filter student-portal build`)
- [ ] No ESLint errors (`pnpm --filter student-portal lint`)

---

## Step 1: Install Next.js Cloudflare Adapter

```bash
# Add adapter to student portal
cd apps/student-portal
pnpm add -D @cloudflare/next-on-pages
cd ../..
```

Update `apps/student-portal/next.config.mjs`:

```javascript
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

// Only in development
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    // Cloudflare doesn't support Next.js Image Optimization API
    unoptimized: true,
  },

  // Experimental features
  experimental: {
    optimizePackageImports: [
      '@elymica/ui',
      '@elymica/api-client',
      '@elymica/hooks',
    ],
  },

  // Transpile workspace packages
  transpilePackages: [
    '@elymica/tokens',
    '@elymica/ui',
    '@elymica/api-client',
    '@elymica/hooks',
    '@elymica/config',
  ],

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    generateEtags: true,
    poweredByHeader: false,
  }),
}

export default nextConfig
```

Update `apps/student-portal/package.json`:

```json
{
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next-on-pages",
    "build:next": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Step 2: Connect Repository to Cloudflare

### Via Dashboard (Recommended for Pilot)

1. **Login to Cloudflare**: https://dash.cloudflare.com
2. **Navigate to Pages**: Left sidebar → Pages
3. **Create Project**: Click "Create a project"
4. **Connect GitHub**:
   - Click "Connect to Git"
   - Authorize Cloudflare
   - Select `elymica-platform` repository

5. **Configure Build**:
   ```
   Project name: elymica-student-portal
   Production branch: main
   Framework preset: Next.js
   Build command: pnpm install && pnpm --filter student-portal build
   Build output directory: apps/student-portal/.vercel/output/static
   Root directory: (leave empty - monorepo root)
   ```

6. **Environment Variables** (click "Add variable"):
   ```
   NODE_VERSION = 18
   PNPM_VERSION = 8
   NEXT_PUBLIC_API_BASE_URL = https://api.elymica.com
   NEXT_PUBLIC_AUTH_ENABLED = true
   NEXT_PUBLIC_ENABLE_ANALYTICS = true
   ```

7. **Advanced Settings**:
   ```
   Build watch paths: apps/student-portal/**, packages/**
   ```

8. **Save and Deploy**: Click "Save and Deploy"

---

## Step 3: Monitor Build

Watch the build logs in real-time:

**Expected Output**:
```
✓ Initializing build environment
✓ Cloning repository
✓ Installing dependencies (pnpm)
✓ Building student-portal
✓ Optimizing for Cloudflare Workers
✓ Deploying to global network
✓ Build successful!
```

**Common Warnings (Safe to Ignore)**:
```
⚠ The following routes were not configured to run with the Edge Runtime:
  - /api/auth/[...nextauth]
```

**Build Time**: 2-4 minutes (first build), ~1 minute (subsequent with cache)

**Deployment URL**: `https://elymica-student-portal.pages.dev`

---

## Step 4: Verify Deployment

### A. Basic Functionality Test

Open deployment URL in browser:

- [ ] Page loads without errors
- [ ] Styling renders correctly (Sahara-Japandi theme)
- [ ] Navigation works (if applicable)
- [ ] Console shows no critical errors (F12 → Console)

### B. Latency Test from African Markets

Use Cloudflare's trace tool to check your routing:

```bash
# From local machine
curl https://elymica-student-portal.pages.dev/cdn-cgi/trace

# Expected output (from Lagos):
fl=xxx
h=elymica-student-portal.pages.dev
ip=xxx.xxx.xxx.xxx
ts=1700000000.000
visit_scheme=https
uag=curl/7.x
colo=LOS  # ← Lagos data center!
sliver=none
http=http/2
loc=NG   # ← Nigeria
tls=TLSv1.3
```

**Key Field**: `colo=LOS` (Lagos), `colo=NBO` (Nairobi), `colo=JNB` (Johannesburg)

### C. Performance Audit

Run Lighthouse from target markets:

```bash
# Install Lighthouse CLI (if not installed)
npm install -g lighthouse

# Run audit
lighthouse https://elymica-student-portal.pages.dev \
  --output=html \
  --output=json \
  --output-path=./lighthouse-reports/student-portal-cloudflare \
  --only-categories=performance,accessibility \
  --chrome-flags="--headless"

# Expected Performance Score: 90-100 (from African IP)
```

**Target Metrics** (from Lagos/Nairobi):
- First Contentful Paint (FCP): < 1.0s
- Largest Contentful Paint (LCP): < 1.5s
- Time to Interactive (TTI): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

### D. API Connectivity Test

Verify API calls work from Cloudflare:

1. Open browser DevTools (F12)
2. Navigate to Network tab
3. Refresh page
4. Check API requests to `NEXT_PUBLIC_API_BASE_URL`
5. Verify CORS headers allow Cloudflare origin

**Expected**:
```
Request URL: https://api.elymica.com/api/...
Status: 200 OK
Access-Control-Allow-Origin: https://elymica-student-portal.pages.dev
```

---

## Step 5: Compare Performance

### Latency Comparison Matrix

Test from multiple African locations (use https://www.dotcom-tools.com/website-speed-test):

| Location | Cloudflare Pages | Local Dev | Target |
|----------|------------------|-----------|--------|
| Lagos, Nigeria 🇳🇬 | ___ms | N/A | < 100ms |
| Nairobi, Kenya 🇰🇪 | ___ms | N/A | < 100ms |
| Johannesburg 🇿🇦 | ___ms | N/A | < 100ms |
| Cairo, Egypt 🇪🇬 | ___ms | N/A | < 100ms |

**How to Test**:
1. Go to https://www.dotcom-tools.com/website-speed-test
2. Enter: `https://elymica-student-portal.pages.dev`
3. Select locations: Lagos, Nairobi, Johannesburg, Cairo
4. Run test
5. Record "Time to First Byte" (TTFB)

### Bundle Size Verification

```bash
# Run bundle analysis on Cloudflare build
cd apps/student-portal

# Check build output
du -sh .vercel/output/static

# Expected: < 5MB total
```

---

## Step 6: Pilot Success Criteria

**Before proceeding to parent/teacher portals, verify**:

- [x] ✅ Student portal loads without errors
- [x] ✅ Latency from Lagos/Nairobi < 100ms
- [x] ✅ Lighthouse Performance Score ≥ 90
- [x] ✅ API connectivity works (CORS, auth)
- [x] ✅ No critical console errors
- [x] ✅ Mobile responsive (test on phone)
- [x] ✅ Build time < 5 minutes
- [x] ✅ Zero downtime on redeploy (test with git push)

---

## Phase 2: Roll Out Parent & Teacher Portals

Once student portal pilot is successful:

### Automated Deployment

```bash
# Update parent portal with adapter
cd apps/parent-portal
pnpm add -D @cloudflare/next-on-pages
# Copy next.config.mjs from student portal
cd ../..

# Update teacher portal with adapter
cd apps/teacher-portal
pnpm add -D @cloudflare/next-on-pages
# Copy next.config.mjs from student portal
cd ../..

# Deploy all portals
./scripts/deploy-cloudflare.sh
```

### Via Dashboard (Manual)

Repeat Step 2 for:
- `elymica-parent-portal` (port 3001 in dev)
- `elymica-teacher-portal` (port 3002 in dev)

---

## Step 7: Custom Domains

### Prerequisites
- Domain registered (elymica.com)
- Domain added to Cloudflare (nameservers updated)

### Map Subdomains

1. **Go to Pages** → Select project → **Custom domains**
2. **Add custom domain**:

**Student Portal**:
```
Custom domain: student.elymica.com
```

**Parent Portal**:
```
Custom domain: parent.elymica.com
```

**Teacher Portal**:
```
Custom domain: teacher.elymica.com
```

3. **SSL Certificate**: Automatically provisioned (2-5 minutes)
4. **Verify**: Visit custom domain (should show SSL lock 🔒)

---

## Step 8: Post-Deployment Regression Checks

### A. Run Full Lighthouse Suite

```bash
# From project root
./scripts/lighthouse-audit.sh

# Update URLs in script to Cloudflare deployments:
# student: https://student.elymica.com
# parent: https://parent.elymica.com
# teacher: https://teacher.elymica.com
```

**Expected Results**:
```
Student Portal:
  Performance:     95/100
  Accessibility:   98/100
  Best Practices:  100/100
  SEO:             92/100

Parent Portal:
  Performance:     94/100
  Accessibility:   98/100
  Best Practices:  100/100
  SEO:             92/100

Teacher Portal:
  Performance:     93/100
  Accessibility:   98/100
  Best Practices:  100/100
  SEO:             90/100
```

### B. Bundle Size Check

```bash
./scripts/analyze-bundle.sh

# Expected output (each portal):
# JavaScript Bundles: < 500KB gzipped
# CSS Bundles: < 50KB
# Total .next size: < 10MB
```

### C. Functional Smoke Tests

**Student Portal**:
- [ ] Login flow works
- [ ] Dashboard loads with mock/live data
- [ ] Classes list displays
- [ ] Assignments page accessible
- [ ] Navigation between pages smooth

**Parent Portal**:
- [ ] Login flow works
- [ ] Child switcher functional
- [ ] Analytics dashboard displays
- [ ] Messaging UI loads
- [ ] Can select child, see filtered data

**Teacher Portal**:
- [ ] Login flow works
- [ ] Class switcher functional
- [ ] Grading queue displays
- [ ] Can submit grade (optimistic UI)
- [ ] Lesson builder (TipTap) renders
- [ ] Rich-text formatting works

### D. Cross-Browser Testing

Test on:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (iOS if possible)
- [ ] Chrome Mobile (Android)

---

## Step 9: Monitor Production

### Enable Cloudflare Web Analytics

1. **Cloudflare Dashboard** → **Analytics** → **Web Analytics**
2. **Add site**: `student.elymica.com`, `parent.elymica.com`, `teacher.elymica.com`
3. **Copy tracking code**

Add to each portal's `app/layout.tsx`:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Cloudflare Web Analytics */}
        <script
          defer
          src='https://static.cloudflareinsights.com/beacon.min.js'
          data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Monitor Key Metrics

**Cloudflare Pages Dashboard**:
- Deployment frequency
- Build success rate
- Error rate (5xx responses)
- Bandwidth usage
- Cache hit rate

**Web Analytics**:
- Page views
- Unique visitors
- Top pages
- Geographic distribution (confirm Nigerian/Kenyan traffic)
- Performance metrics (FCP, LCP)

---

## Troubleshooting

### Build Fails: "Cannot find module @elymica/ui"

**Solution**: Use monorepo-aware build command:

```bash
# Instead of:
pnpm --filter student-portal build

# Use:
cd ../.. && pnpm install && pnpm --filter student-portal build
```

Update in Cloudflare Pages settings.

### Adapter Warning: "Edge Runtime not configured"

**Solution**: This is expected for NextAuth routes. They'll run in Node.js compat mode. Safe to ignore.

### Images Not Loading

**Solution**: Use Cloudflare Image Resizing instead of Next.js Image Optimization:

```tsx
// Instead of:
<Image src="/logo.png" width={100} height={100} alt="Logo" />

// Use:
<img
  src="https://elymica.com/cdn-cgi/image/width=100,height=100/logo.png"
  alt="Logo"
  width={100}
  height={100}
/>
```

### CORS Errors from API

**Solution**: Update backend CORS to allow Cloudflare domains:

```javascript
// Backend CORS config
const allowedOrigins = [
  'https://student.elymica.com',
  'https://parent.elymica.com',
  'https://teacher.elymica.com',
  'https://elymica-student-portal.pages.dev',
  'https://elymica-parent-portal.pages.dev',
  'https://elymica-teacher-portal.pages.dev',
]
```

### Slow Build Times (> 5 minutes)

**Solution**: Enable build cache in Cloudflare Pages settings:
1. **Settings** → **Builds & deployments**
2. Enable **Build cache**
3. Subsequent builds will be 2-3x faster

---

## Success Metrics

### Week 1 (Pilot)
- [x] Student portal deployed to Cloudflare
- [x] Latency from Lagos/Nairobi measured
- [x] Lighthouse score ≥ 90
- [x] API connectivity verified

### Week 2 (Full Rollout)
- [ ] All 3 portals deployed
- [ ] Custom domains configured (student/parent/teacher.elymica.com)
- [ ] SSL certificates active
- [ ] GitHub Actions CI/CD configured
- [ ] Monitoring enabled (Web Analytics)

### Week 3 (Optimization)
- [ ] Performance optimizations applied based on real user data
- [ ] Bundle sizes optimized (code splitting)
- [ ] Cache policies tuned
- [ ] Load testing completed (1000+ concurrent users)

---

## Rollback Plan

If deployment has critical issues:

1. **Instant Rollback**:
   - Cloudflare Pages → Deployments → Previous deployment → "Rollback"
   - Takes effect in ~30 seconds globally

2. **Gradual Rollout** (if available):
   - Use Cloudflare Workers to route % of traffic to new version
   - Monitor error rates
   - Increase traffic gradually

3. **DNS Failover**:
   - Keep old deployment URL as backup
   - Update DNS to point to backup if needed

---

## Next Steps After Pilot

1. **Document Performance**: Capture baseline metrics (latency, Lighthouse scores)
2. **User Testing**: Have Nigerian/Kenyan beta users test
3. **Iterate**: Address any performance/UX issues
4. **Full Rollout**: Deploy parent + teacher portals
5. **Monitor**: Watch Web Analytics for traffic patterns
6. **Optimize**: Code splitting, lazy loading based on real usage

---

**Estimated Timeline**:
- Pilot setup: 2-4 hours
- Verification: 1-2 hours
- Full rollout: 1-2 hours
- **Total**: 1 working day

**Cost**: $0 (free tier)

**Performance Gain**: 4-7x faster load times for African users vs Vercel

---

**Ready to start?** Begin with Step 1 (adapter installation) and proceed sequentially. Document any issues encountered for troubleshooting guide updates.
