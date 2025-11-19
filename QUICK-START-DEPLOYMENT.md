# Quick Start: Cloudflare Pages Deployment

**⏱️ Time**: 1 working day | **💰 Cost**: $0 (free tier) | **🚀 Latency**: 20-50ms from Africa

---

## TL;DR

```bash
# 1. Install adapter
cd apps/student-portal
pnpm add -D @cloudflare/next-on-pages

# 2. Update build script in package.json
# "build": "next-on-pages"

# 3. Connect GitHub to Cloudflare Pages dashboard
# https://dash.cloudflare.com/pages

# 4. Deploy and test
./scripts/test-cloudflare-latency.sh https://elymica-student-portal.pages.dev

# 5. Roll out other portals
./scripts/deploy-cloudflare.sh
```

---

## 4-Step Deployment

### 1️⃣ Prepare Student Portal (15 min)

```bash
cd apps/student-portal
pnpm add -D @cloudflare/next-on-pages
```

Update `package.json`:
```json
{
  "scripts": {
    "build": "next-on-pages"
  }
}
```

Update `next.config.mjs`:
```javascript
const nextConfig = {
  images: {
    unoptimized: true, // Required for Cloudflare
  },
  // ... rest of config
}
```

Test build:
```bash
pnpm build
# Verify .vercel/output/static exists
```

### 2️⃣ Deploy to Cloudflare (5 min)

1. Go to https://dash.cloudflare.com/pages
2. Click **Create a project** → **Connect to Git**
3. Select `elymica-platform` repo
4. Configure:
   - Project name: `elymica-student-portal`
   - Build command: `pnpm install && pnpm --filter student-portal build`
   - Build output: `apps/student-portal/.vercel/output/static`
5. Add env vars:
   - `NODE_VERSION = 18`
   - `PNPM_VERSION = 8`
   - `NEXT_PUBLIC_API_BASE_URL = https://api.elymica.com`
6. Click **Save and Deploy**

### 3️⃣ Test Performance (10 min)

```bash
# Test latency
./scripts/test-cloudflare-latency.sh https://elymica-student-portal.pages.dev

# Run Lighthouse
lighthouse https://elymica-student-portal.pages.dev \
  --output=html \
  --only-categories=performance,accessibility
```

**Success Criteria**:
- ✅ Latency < 100ms from your region
- ✅ Lighthouse Performance ≥ 90
- ✅ Site loads without errors

### 4️⃣ Roll Out All Portals (30 min)

Repeat steps 1-2 for parent and teacher portals, OR:

```bash
# Automated deployment
./scripts/deploy-cloudflare.sh
```

Then configure custom domains:
- `student.elymica.com`
- `parent.elymica.com`
- `teacher.elymica.com`

---

## Troubleshooting

### Build Fails: "pnpm not found"
Add `PNPM_VERSION = 8` to environment variables.

### Images Not Loading
Set `images.unoptimized = true` in `next.config.mjs`.

### API CORS Errors
Add Cloudflare domains to backend CORS:
```javascript
allowedOrigins = [
  'https://elymica-student-portal.pages.dev',
  'https://student.elymica.com',
]
```

---

## Resources

- 📋 [Full Deployment Checklist](DEPLOYMENT-CHECKLIST.md) - Step-by-step with checkboxes
- 🚀 [Pilot Guide](docs/CLOUDFLARE-PILOT-DEPLOYMENT.md) - Detailed student portal deployment
- 📊 [Platform Comparison](docs/DEPLOYMENT-OPTIONS.md) - Why Cloudflare vs others
- 🔧 [Full Setup Guide](docs/CLOUDFLARE-DEPLOYMENT.md) - CI/CD, monitoring, optimization

---

## Next Steps After Deployment

1. **Monitor**: Enable Cloudflare Web Analytics
2. **Optimize**: Review performance metrics, optimize slow pages
3. **Scale**: Add more edge caching rules as traffic grows
4. **Automate**: Set up GitHub Actions for auto-deployment

---

**Questions?** See [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) for comprehensive guide.
