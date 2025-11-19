# Cloudflare Pages Deployment Checklist

**Status**: Ready for pilot deployment
**Platform**: Cloudflare Pages (Free Tier)
**Timeline**: 1 working day

---

## Pre-Deployment

### ✅ Week 3 Complete
- [x] All 3 portals built (student, parent, teacher)
- [x] UX polished (optimistic UI, toasts, validation)
- [x] Accessibility audit complete (WCAG AA)
- [x] Performance optimized (Lighthouse scripts ready)
- [x] Build verification scripts created
- [x] Deployment documentation written

### 🔧 Local Verification
- [ ] Build all portals locally: `pnpm build`
- [ ] Run linting: `pnpm lint`
- [ ] Test dev servers: `pnpm dev`
- [ ] Verify environment variables documented

---

## Phase 1: Pilot Deployment (Student Portal)

### Step 1: Install Cloudflare Adapter
- [ ] `cd apps/student-portal`
- [ ] `pnpm add -D @cloudflare/next-on-pages`
- [ ] Update `next.config.mjs` (see [CLOUDFLARE-PILOT-DEPLOYMENT.md](docs/CLOUDFLARE-PILOT-DEPLOYMENT.md))
- [ ] Update `package.json` build script: `"build": "next-on-pages"`
- [ ] Test local build: `pnpm build`
- [ ] Verify `.vercel/output/static` directory created

### Step 2: Connect to Cloudflare
- [ ] Create Cloudflare account at https://dash.cloudflare.com
- [ ] Navigate to **Pages** → **Create a project**
- [ ] Connect GitHub repository
- [ ] Select `elymica-platform` repo

### Step 3: Configure Build Settings
```
Project name: elymica-student-portal
Production branch: main
Build command: pnpm install && pnpm --filter student-portal build
Build output directory: apps/student-portal/.vercel/output/static
Root directory: (empty)
```

### Step 4: Environment Variables
Add in Cloudflare Pages settings:
- [ ] `NODE_VERSION = 18`
- [ ] `PNPM_VERSION = 8`
- [ ] `NEXT_PUBLIC_API_BASE_URL = https://api.elymica.com`
- [ ] `NEXT_PUBLIC_AUTH_ENABLED = true`
- [ ] `NEXT_PUBLIC_ENABLE_ANALYTICS = true`

### Step 5: Deploy
- [ ] Click **Save and Deploy**
- [ ] Monitor build logs (2-4 minutes)
- [ ] Verify build success
- [ ] Note deployment URL: `https://elymica-student-portal.pages.dev`

---

## Phase 2: Pilot Verification

### Functional Tests
- [ ] Open deployment URL in browser
- [ ] Verify page loads without errors
- [ ] Check console for errors (F12)
- [ ] Verify Sahara-Japandi styling renders
- [ ] Test navigation (if applicable)
- [ ] Test on mobile device

### Latency Tests
Run from your local machine (represents your region):
```bash
./scripts/test-cloudflare-latency.sh https://elymica-student-portal.pages.dev
```

- [ ] Record average TTFB: ____ms
- [ ] Verify edge location (COLO code): ____
- [ ] Target: TTFB < 200ms from your location

**Ideal**: Test from Lagos/Nairobi using:
- https://www.dotcom-tools.com/website-speed-test
- Select: Lagos, Nairobi, Johannesburg, Cairo
- [ ] Lagos TTFB: ____ms (target: < 100ms)
- [ ] Nairobi TTFB: ____ms (target: < 100ms)
- [ ] Johannesburg TTFB: ____ms (target: < 100ms)

### Performance Audit
```bash
lighthouse https://elymica-student-portal.pages.dev \
  --output=html \
  --output-path=./lighthouse-reports/student-portal-cloudflare.html \
  --only-categories=performance,accessibility
```

- [ ] Performance Score: ____ / 100 (target: ≥ 90)
- [ ] Accessibility Score: ____ / 100 (target: ≥ 95)
- [ ] FCP: ____s (target: < 1.5s)
- [ ] LCP: ____s (target: < 2.5s)
- [ ] CLS: ____ (target: < 0.1)

### API Connectivity
- [ ] Open DevTools → Network tab
- [ ] Refresh page
- [ ] Verify API requests succeed (status 200)
- [ ] Check CORS headers allow Cloudflare origin
- [ ] Test authentication flow (if enabled)

---

## Phase 3: Decision Point

**Pilot Success Criteria**:
- [x] Student portal loads without errors
- [x] Latency from target markets acceptable (< 100ms ideal)
- [x] Lighthouse Performance ≥ 90
- [x] API connectivity works
- [x] No critical console errors
- [x] Mobile responsive

**Decision**:
- [ ] ✅ Proceed with full rollout (parent + teacher portals)
- [ ] ⚠️ Address issues first (document in troubleshooting section)
- [ ] ❌ Revert to alternative platform (Vercel/AWS)

---

## Phase 4: Full Rollout

### Parent Portal Deployment
- [ ] `cd apps/parent-portal`
- [ ] `pnpm add -D @cloudflare/next-on-pages`
- [ ] Copy `next.config.mjs` from student portal (adjust port)
- [ ] Update `package.json` build script
- [ ] Test local build: `pnpm build`
- [ ] Create Cloudflare Pages project: `elymica-parent-portal`
- [ ] Configure build settings (same as student portal)
- [ ] Add environment variables
- [ ] Deploy and verify

### Teacher Portal Deployment
- [ ] `cd apps/teacher-portal`
- [ ] `pnpm add -D @cloudflare/next-on-pages`
- [ ] Copy `next.config.mjs` from student portal (adjust port)
- [ ] Update `package.json` build script
- [ ] Test local build: `pnpm build`
- [ ] Create Cloudflare Pages project: `elymica-teacher-portal`
- [ ] Configure build settings (same as student portal)
- [ ] Add environment variables
- [ ] Deploy and verify

### Automated Deployment (Optional)
```bash
./scripts/deploy-cloudflare.sh
```

- [ ] Verify all 3 portals deployed successfully
- [ ] Note deployment URLs:
  - Student: https://elymica-student-portal.pages.dev
  - Parent: https://elymica-parent-portal.pages.dev
  - Teacher: https://elymica-teacher-portal.pages.dev

---

## Phase 5: Custom Domains

### Prerequisites
- [ ] Domain `elymica.com` registered
- [ ] Domain added to Cloudflare (nameservers updated)
- [ ] DNS records propagated (check: `dig elymica.com`)

### Configure Subdomains

**Student Portal**:
- [ ] Pages → elymica-student-portal → Custom domains
- [ ] Add domain: `student.elymica.com`
- [ ] Wait for SSL certificate (2-5 minutes)
- [ ] Verify: https://student.elymica.com (SSL lock 🔒)

**Parent Portal**:
- [ ] Add domain: `parent.elymica.com`
- [ ] Wait for SSL certificate
- [ ] Verify: https://parent.elymica.com

**Teacher Portal**:
- [ ] Add domain: `teacher.elymica.com`
- [ ] Wait for SSL certificate
- [ ] Verify: https://teacher.elymica.com

### Update Backend CORS
Add custom domains to backend CORS allowlist:
```javascript
const allowedOrigins = [
  'https://student.elymica.com',
  'https://parent.elymica.com',
  'https://teacher.elymica.com',
  'https://elymica-student-portal.pages.dev',
  'https://elymica-parent-portal.pages.dev',
  'https://elymica-teacher-portal.pages.dev',
]
```

- [ ] Updated backend CORS configuration
- [ ] Tested API calls from custom domains
- [ ] Verified auth flow works on custom domains

---

## Phase 6: Post-Deployment Regression

### Lighthouse Audits (All Portals)
Update `scripts/lighthouse-audit.sh` with custom domain URLs, then:

```bash
./scripts/lighthouse-audit.sh
```

**Expected Scores**:
- [ ] Student Portal: Performance ≥ 90, Accessibility ≥ 95
- [ ] Parent Portal: Performance ≥ 90, Accessibility ≥ 95
- [ ] Teacher Portal: Performance ≥ 90, Accessibility ≥ 95

### Bundle Size Verification
```bash
./scripts/analyze-bundle.sh
```

- [ ] Each portal: JavaScript < 500KB gzipped
- [ ] Each portal: CSS < 50KB
- [ ] Total build size: < 10MB per portal

### Functional Smoke Tests

**Student Portal** (https://student.elymica.com):
- [ ] Login page loads
- [ ] Dashboard displays (with mock/live data)
- [ ] Classes list renders
- [ ] Assignments page accessible
- [ ] Navigation smooth, no flickering

**Parent Portal** (https://parent.elymica.com):
- [ ] Login page loads
- [ ] Child switcher functional
- [ ] Analytics dashboard displays
- [ ] Messaging UI loads
- [ ] Can select child, see filtered data

**Teacher Portal** (https://teacher.elymica.com):
- [ ] Login page loads
- [ ] Class switcher functional
- [ ] Grading queue displays
- [ ] Grading form works (optimistic UI)
- [ ] Lesson builder renders (TipTap editor)
- [ ] Rich-text formatting works

### Cross-Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (macOS/iOS if available)
- [ ] Chrome Mobile (Android)

### Cross-Device Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Phase 7: Monitoring Setup

### Cloudflare Web Analytics
- [ ] Dashboard → Analytics → Web Analytics
- [ ] Add site: `student.elymica.com`
- [ ] Add site: `parent.elymica.com`
- [ ] Add site: `teacher.elymica.com`
- [ ] Copy tracking code (Beacon script)
- [ ] Add to each portal's `app/layout.tsx`
- [ ] Verify events tracking (check dashboard after 1 hour)

### Monitor Dashboards
- [ ] Cloudflare Pages → Deployments (build status)
- [ ] Cloudflare Pages → Analytics (traffic, bandwidth)
- [ ] Cloudflare Web Analytics (user behavior, performance)

**Key Metrics to Watch**:
- Deployment success rate (target: 100%)
- Error rate (5xx responses, target: < 0.1%)
- Average TTFB (target: < 100ms from Africa)
- Cache hit rate (target: > 80%)
- Unique visitors from Nigeria/Kenya/South Africa

---

## Phase 8: CI/CD Automation

### GitHub Actions Setup
- [ ] Create `.github/workflows/deploy-cloudflare.yml`
- [ ] Add Cloudflare API token to GitHub Secrets
- [ ] Add Cloudflare Account ID to GitHub Secrets
- [ ] Test automated deployment (push to main branch)
- [ ] Verify all 3 portals auto-deploy

**GitHub Secrets Required**:
- `CLOUDFLARE_API_TOKEN`: From Cloudflare Dashboard → My Profile → API Tokens
- `CLOUDFLARE_ACCOUNT_ID`: From Pages URL

### Test Automated Deploy
```bash
# Make a trivial change
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger automated deployment"
git push origin main

# Watch GitHub Actions
# Verify builds succeed
# Check Cloudflare Pages deployments
```

- [ ] GitHub Actions workflow runs
- [ ] All 3 portals build successfully
- [ ] Deployments appear in Cloudflare Pages
- [ ] Sites update within 2-3 minutes

---

## Phase 9: Documentation

### Update Production URLs
- [ ] Update `README.md` with production URLs
- [ ] Update `SPRINT-3-STATUS.md` with deployment status
- [ ] Create `DEPLOYMENT-COMPLETE.md` report
- [ ] Document any issues encountered in troubleshooting guide

### User Communication
- [ ] Notify stakeholders of deployment
- [ ] Share production URLs:
  - Student: https://student.elymica.com
  - Parent: https://parent.elymica.com
  - Teacher: https://teacher.elymica.com
- [ ] Share Lighthouse scores
- [ ] Share latency metrics from African markets

---

## Phase 10: Post-Launch Monitoring (Week 1)

### Daily Checks
- [ ] Check Cloudflare Pages deployment status
- [ ] Review error logs (if any 5xx errors)
- [ ] Monitor bandwidth usage
- [ ] Check Web Analytics for traffic patterns

### Week 1 Review
- [ ] Unique visitors: ____
- [ ] Top pages: ____
- [ ] Geographic distribution: ____
- [ ] Average session duration: ____
- [ ] Bounce rate: ____
- [ ] Performance metrics stable: ____

### Optimization Opportunities
Based on real user data:
- [ ] Identify slow pages (optimize those first)
- [ ] Check geographic distribution (add more edge caching if needed)
- [ ] Review error logs (fix any runtime errors)
- [ ] Analyze bundle sizes (code split large pages)

---

## Rollback Plan

**If critical issues arise**:

### Immediate Rollback (< 1 minute)
1. Go to Cloudflare Pages → Project → Deployments
2. Find previous working deployment
3. Click "Rollback to this deployment"
4. Verify site restored

### DNS Failover (< 5 minutes)
1. Keep old deployment URLs as backup
2. Update DNS CNAME records to point to backup
3. Wait for DNS propagation (1-5 minutes with Cloudflare)

### Full Revert (< 30 minutes)
1. Revert git commits: `git revert <commit-hash>`
2. Push to main: `git push origin main`
3. GitHub Actions auto-deploys previous version
4. Verify all portals restored

---

## Success Criteria

**Deployment is successful when**:
- ✅ All 3 portals live on custom domains
- ✅ SSL certificates active (HTTPS)
- ✅ Lighthouse scores ≥ 90 (performance)
- ✅ Latency from Lagos/Nairobi < 100ms
- ✅ No critical errors in console
- ✅ API connectivity working
- ✅ Zero downtime on deployments
- ✅ Monitoring enabled (Web Analytics)
- ✅ CI/CD automated (GitHub Actions)

---

## Issues & Resolutions

Document any issues encountered:

| Issue | Resolution | Time to Fix |
|-------|-----------|-------------|
| (Example) Build failed - pnpm not found | Added `PNPM_VERSION = 8` env var | 5 minutes |
| | | |
| | | |

---

## Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Pre-deployment checks | 30 min | ⏳ Pending |
| Pilot deployment (student) | 1-2 hours | ⏳ Pending |
| Pilot verification | 1 hour | ⏳ Pending |
| Full rollout (parent/teacher) | 1-2 hours | ⏳ Pending |
| Custom domains | 30 min | ⏳ Pending |
| Regression testing | 1 hour | ⏳ Pending |
| Monitoring setup | 30 min | ⏳ Pending |
| CI/CD automation | 1 hour | ⏳ Pending |
| **Total** | **6-9 hours** | ⏳ Pending |

---

**Next Action**: Begin Phase 1 (Pilot Deployment) when ready.

**Resources**:
- [Detailed Pilot Guide](docs/CLOUDFLARE-PILOT-DEPLOYMENT.md)
- [Platform Comparison](docs/DEPLOYMENT-OPTIONS.md)
- [Cloudflare Setup Guide](docs/CLOUDFLARE-DEPLOYMENT.md)
- [Deployment Scripts](scripts/)
