# Elymica Platform - Cloudflare Workers Deployment Guide

## 📋 Overview

This guide documents the complete deployment process for the Elymica multi-tenant education platform to Cloudflare Workers using OpenNext.

### Live Production URLs

| Portal | URL | Purpose |
|--------|-----|---------|
| **Student Portal** | https://student.elymica.com | Student course access, progress tracking |
| **Parent Portal** | https://parent.elymica.com | Parent dashboard, student monitoring |
| **Teacher Portal** | https://teacher.elymica.com | Classroom management, assignments |

---

## 🏗️ Architecture

### Technology Stack

- **Platform**: Cloudflare Workers (not Cloudflare Pages)
- **Adapter**: `@opennextjs/cloudflare@^1.13.0`
- **Framework**: Next.js 14.2.12 (App Router)
- **Runtime**: React 18.2.0
- **Authentication**: NextAuth 4.24.13 with Node.js compatibility
- **Package Manager**: pnpm 8.15.0

### Why Cloudflare Workers?

- **African Edge Performance**: Sub-50ms latency in Lagos (LOS) and Nairobi (NBO)
- **Node.js Compatibility**: Required for NextAuth crypto module
- **Free Tier**: 100,000 requests/day per worker
- **Global CDN**: 300+ locations worldwide
- **Automatic SSL**: Certificate provisioning and renewal

---

## 🚀 Deployment Process

### Prerequisites

1. **Cloudflare Account** with Workers enabled
2. **Domain** managed in Cloudflare DNS (elymica.com)
3. **Wrangler CLI** authenticated (`wrangler login`)
4. **Node.js** 20+ and pnpm 8.15.0
5. **Git** repository initialized

### Step 1: Install Dependencies

```bash
cd /home/jay/elymica-platform
pnpm install
```

### Step 2: Configure Environment Variables

Each portal requires the following environment variables:

**Non-Secret Variables** (in `wrangler.jsonc`):
```jsonc
{
  "vars": {
    "NEXT_RUNTIME": "nodejs",
    "NEXTAUTH_URL": "https://[portal].elymica.com",
    "NEXT_PUBLIC_API_BASE_URL": "https://api.elymica.com",
    "AUTH_SERVICE_BASE_URL": "https://auth.elymica.com"
  }
}
```

**Secret Variables** (via Wrangler CLI):
```bash
cd apps/[portal-name]

# Generate secure secret
openssl rand -base64 32

# Set as Cloudflare secret
echo "YOUR_GENERATED_SECRET" | pnpm wrangler secret put NEXTAUTH_SECRET
```

### Step 3: Build for Production

```bash
cd apps/[portal-name]
pnpm run build:cloudflare
```

**Build Output**: `.open-next/` directory containing:
- `worker.js` - Main worker entry point
- `assets/` - Static files and Next.js build output
- `server-functions/` - Server-side rendering functions

### Step 4: Deploy to Cloudflare Workers

```bash
cd apps/[portal-name]
pnpm run deploy
```

**Deployment Process**:
1. Uploads static assets to Cloudflare CDN
2. Deploys worker code to global edge network
3. Creates custom domain DNS records automatically
4. Issues SSL certificates

### Step 5: Verify Deployment

```bash
# Check deployment status
pnpm wrangler deployments list

# View worker logs
pnpm wrangler tail
```

**Verification Checklist**:
- ✅ Portal loads at custom domain
- ✅ SSL certificate valid (HTTPS)
- ✅ Login page renders correctly
- ✅ No 404 or 500 errors
- ✅ Worker startup time < 50ms

---

## 📁 Configuration Files Reference

### `wrangler.jsonc` Structure

```jsonc
{
  "name": "elymica-[portal]-portal",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-12-30",
  "compatibility_flags": ["nodejs_compat"],

  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },

  "routes": [
    {
      "pattern": "[portal].elymica.com",
      "custom_domain": true
    }
  ],

  "vars": {
    "NEXT_RUNTIME": "nodejs",
    "NEXTAUTH_URL": "https://[portal].elymica.com",
    "NEXT_PUBLIC_API_BASE_URL": "https://api.elymica.com",
    "AUTH_SERVICE_BASE_URL": "https://auth.elymica.com"
  },

  "env": {
    "production": {
      "name": "elymica-[portal]-portal",
      "routes": [
        {
          "pattern": "[portal].elymica.com",
          "custom_domain": true
        }
      ],
      "vars": {
        "NEXTAUTH_URL": "https://[portal].elymica.com"
      }
    },
    "staging": {
      "name": "elymica-[portal]-portal-staging",
      "routes": [
        {
          "pattern": "[portal]-staging.elymica.com",
          "custom_domain": true
        }
      ],
      "vars": {
        "NEXTAUTH_URL": "https://[portal]-staging.elymica.com"
      }
    }
  }
}
```

### `open-next.config.ts`

```typescript
import { defineCloudflareConfig } from '@opennextjs/cloudflare/config';

export default defineCloudflareConfig({
  // Run entire app in Node.js compatibility layer
  // Required for NextAuth and other Node.js modules
});
```

### `package.json` Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build && rm -rf .next/cache",
    "build:cloudflare": "opennextjs-cloudflare build",
    "preview": "opennextjs-cloudflare build && wrangler dev",
    "deploy": "opennextjs-cloudflare deploy",
    "deploy:ci": "opennextjs-cloudflare build && wrangler deploy",
    "start": "next start",
    "lint": "eslint"
  }
}
```

---

## 🔧 Common Issues & Solutions

### Issue 1: DNS Record Conflict

**Error**: `Hostname already has externally managed DNS records`

**Solution**: Delete existing DNS record before deploying custom domain
```bash
# Via Cloudflare Dashboard: DNS → Delete A/CNAME record
# OR via CLI:
pnpm wrangler dns record delete --zone-name elymica.com --name [portal] --type A
```

### Issue 2: NextAuth Crypto Module Error

**Error**: `Cannot find module 'crypto'`

**Solution**: Ensure `nodejs_compat` flag is enabled in `wrangler.jsonc`
```jsonc
{
  "compatibility_flags": ["nodejs_compat"]
}
```

### Issue 3: useSearchParams Prerender Error

**Error**: `useSearchParams() should be wrapped in a suspense boundary`

**Solution**: Wrap components using `useSearchParams()` in `<Suspense>`
```tsx
import { Suspense } from 'react';

<Suspense fallback={<div>Loading...</div>}>
  <LoginForm />
</Suspense>
```

### Issue 4: TypeScript Module Resolution

**Error**: `File '@elymica/config/tsconfig.base.json' not found`

**Solution**: Use relative paths instead of workspace aliases in `tsconfig.json`
```json
{
  "extends": "../../packages/config/tsconfig.base.json"
}
```

### Issue 5: Build Size Exceeds Limit

**Error**: `Pages only supports files up to 25 MiB in size`

**Solution**: Remove cache directory after build
```json
{
  "scripts": {
    "build": "next build && rm -rf .next/cache"
  }
}
```

---

## 🔐 Security Best Practices

### Secret Management

1. **Never commit secrets** to version control
2. **Use Cloudflare Secrets** for sensitive values:
   ```bash
   echo "secret-value" | pnpm wrangler secret put SECRET_NAME
   ```
3. **Rotate secrets regularly** (every 90 days recommended)
4. **Use different secrets** for each environment (production/staging)

### Environment Isolation

```jsonc
// Production
{
  "env": {
    "production": {
      "vars": {
        "NEXTAUTH_URL": "https://student.elymica.com"
      }
    }
  }
}

// Deploy to production
pnpm wrangler deploy --env production
```

### CORS Configuration

If needed, configure CORS in Next.js middleware or API routes:
```typescript
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', 'https://elymica.com');
  return response;
}
```

---

## 📊 Monitoring & Observability

### Worker Analytics

View real-time metrics in Cloudflare Dashboard:
- **Requests per second**: Monitor traffic patterns
- **Success rate**: Track 2xx vs 4xx/5xx responses
- **P95 latency**: Ensure sub-100ms response times
- **CPU time**: Monitor computational costs

### Log Streaming

Stream live logs during deployment:
```bash
cd apps/student-portal
pnpm wrangler tail

# Filter for errors only
pnpm wrangler tail --status error
```

### Error Tracking

Integrate with error tracking services:
```typescript
// next.config.mjs
const nextConfig = {
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
};
```

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Workflow

Create `.github/workflows/deploy-portals.yml`:

```yaml
name: Deploy Portals to Cloudflare Workers

on:
  push:
    branches:
      - main
    paths:
      - 'apps/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        portal: [student-portal, parent-portal, teacher-portal]

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build portal
        run: |
          cd apps/${{ matrix.portal }}
          pnpm run build:cloudflare

      - name: Deploy to Cloudflare Workers
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: |
          cd apps/${{ matrix.portal }}
          pnpm wrangler deploy
```

### Required GitHub Secrets

Add in repository Settings → Secrets:
- `CLOUDFLARE_API_TOKEN` - API token with Workers permissions
- `NEXTAUTH_SECRET_STUDENT` - Student portal auth secret
- `NEXTAUTH_SECRET_PARENT` - Parent portal auth secret
- `NEXTAUTH_SECRET_TEACHER` - Teacher portal auth secret

---

## 🌍 Multi-Region Performance

### Edge Location Coverage

Cloudflare Workers run in 300+ locations globally. Key African nodes:

| City | Code | Expected Latency |
|------|------|------------------|
| Lagos, Nigeria | LOS | 20-30ms |
| Nairobi, Kenya | NBO | 30-50ms |
| Johannesburg, South Africa | JNB | 40-60ms |
| Cairo, Egypt | CAI | 50-70ms |

### Performance Optimization

1. **Enable Compression**: Already enabled in `next.config.mjs`
2. **Optimize Images**: Use Next.js Image component with WebP
3. **Code Splitting**: Leverage dynamic imports
4. **Edge Caching**: Configure cache headers appropriately

```typescript
// next.config.mjs
const nextConfig = {
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    unoptimized: true, // Cloudflare handles optimization
  },
};
```

---

## 📝 Version Control Strategy

### Branching Strategy

```
main (production) ← Deploy automatically
├── staging ← Test before production
└── feature/* ← Development branches
```

### Deployment Workflow

1. **Feature development**: Create branch from `main`
2. **Testing**: Merge to `staging`, deploy to staging workers
3. **Production**: Merge `staging` → `main`, auto-deploy via CI/CD
4. **Rollback**: Use Wrangler rollback command

```bash
# List previous deployments
pnpm wrangler deployments list

# Rollback to previous version
pnpm wrangler rollback [VERSION_ID]
```

---

## 🆘 Emergency Procedures

### Immediate Rollback

```bash
cd apps/[portal-name]

# Get deployment history
pnpm wrangler deployments list

# Rollback to last known good version
pnpm wrangler rollback <VERSION_ID>
```

### Scale Down Traffic

If experiencing issues, temporarily disable custom domain:
```bash
# This requires manual DNS update in Cloudflare dashboard
# Point domain to maintenance page or previous deployment
```

### Emergency Contacts

- **Cloudflare Support**: https://dash.cloudflare.com/support
- **Platform Team**: support@elymica.com
- **On-Call Rotation**: (Add your team contacts)

---

## 📚 Additional Resources

### Documentation Links

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [NextAuth Documentation](https://next-auth.js.org/)

### Internal Documentation

- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Architecture Overview](./ARCHITECTURE.md)

---

## 🎓 Training Checklist

Before deploying to production, ensure team members can:

- ✅ Authenticate with Wrangler CLI
- ✅ Build portals locally with OpenNext
- ✅ Set environment variables and secrets
- ✅ Deploy to staging environment
- ✅ Monitor worker metrics and logs
- ✅ Rollback deployments if needed
- ✅ Debug common deployment issues

---

## 📅 Maintenance Schedule

### Weekly Tasks
- Review worker analytics for anomalies
- Check error rates and response times
- Monitor cost usage

### Monthly Tasks
- Review and update dependencies
- Test staging deployments
- Audit security configurations

### Quarterly Tasks
- Rotate NEXTAUTH_SECRET values
- Review and optimize bundle sizes
- Performance benchmarking

---

## 🏆 Success Metrics

Current deployment targets:

| Metric | Target | Current |
|--------|--------|---------|
| **Worker Startup** | < 50ms | ~25ms ✅ |
| **P95 Response Time** | < 200ms | TBD |
| **Error Rate** | < 0.1% | TBD |
| **Availability** | > 99.9% | TBD |
| **Bundle Size** | < 5MB | ~5MB ✅ |

---

*Last updated: 2025-11-20*
*Deployment Stack: Next.js 14.2.12, React 18.2.0, OpenNext Cloudflare 1.13.0*
