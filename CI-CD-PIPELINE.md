# CI/CD Pipeline - Automated Deployments

## 📋 Overview

This document describes the GitHub Actions CI/CD pipeline for automatically deploying the Elymica portals to Cloudflare Workers.

## 🔄 Workflow Configuration

### Workflow File

Location: [`.github/workflows/deploy-portals.yml`](file:///.github/workflows/deploy-portals.yml)

### Trigger Conditions

The workflow runs automatically when:

1. **Push to main branch** with changes to:
   - `apps/**` - Any portal code changes
   - `packages/**` - Shared package changes
   - `.github/workflows/deploy-portals.yml` - Workflow changes

2. **Manual trigger** via GitHub Actions UI:
   - Can deploy all portals or a specific portal
   - Useful for rollbacks or emergency deployments

### Deployment Strategy

**Matrix Deployment**: All three portals deploy in parallel
- `student-portal`
- `parent-portal`
- `teacher-portal`

**Fail-Fast**: Disabled - if one portal fails, others continue

## 🔐 Required GitHub Secrets

Configure these in your repository Settings → Secrets and variables → Actions:

### 1. CLOUDFLARE_API_TOKEN

**Purpose**: Authenticates GitHub Actions with Cloudflare API

**How to obtain**:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to My Profile → API Tokens
3. Click "Create Token"
4. Use "Edit Cloudflare Workers" template
5. Configure permissions:
   - Account: Workers Scripts - Edit
   - Account: Workers KV Storage - Edit (if using KV)
   - Zone: Workers Routes - Edit
   - Zone: DNS - Edit (for custom domains)
6. Copy the token (shown only once!)

**Add to GitHub**:
```bash
Repository Settings → Secrets → New repository secret
Name: CLOUDFLARE_API_TOKEN
Value: [paste your token]
```

### 2. CLOUDFLARE_ACCOUNT_ID

**Purpose**: Identifies your Cloudflare account for deployments

**How to obtain**:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select any domain
3. Scroll down in the Overview page
4. Copy "Account ID" from the right sidebar

**Add to GitHub**:
```bash
Repository Settings → Secrets → New repository secret
Name: CLOUDFLARE_ACCOUNT_ID
Value: [paste your account ID]
```

## 🚀 Workflow Steps

### Step 1: Checkout Repository
```yaml
- uses: actions/checkout@v4
```
Clones the repository code to the runner

### Step 2: Setup pnpm
```yaml
- uses: pnpm/action-setup@v2
  with:
    version: 8.15.0
```
Installs pnpm package manager (version must match workspace)

### Step 3: Setup Node.js
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'
```
Installs Node.js 20 with pnpm cache for faster builds

### Step 4: Install Dependencies
```bash
pnpm install --frozen-lockfile
```
Installs all dependencies from `pnpm-lock.yaml` (no version changes)

### Step 5: Build Portal
```bash
cd apps/${{ matrix.portal }}
pnpm run build:cloudflare
```
Builds the portal with OpenNext for Cloudflare Workers

### Step 6: Deploy to Cloudflare
```bash
cd apps/${{ matrix.portal }}
pnpm wrangler deploy
```
Deploys the built worker to Cloudflare's global network

### Step 7: Deployment Summary
Creates a summary in GitHub Actions UI showing:
- ✅ Success status
- Portal name
- Commit SHA
- Triggered by (username)

## 📊 Deployment Process

### Automatic Deployment

When you push to `main`:

```bash
git add .
git commit -m "Update student portal UI"
git push origin main
```

GitHub Actions will:
1. Detect changes in `apps/student-portal/**`
2. Trigger workflow
3. Build all three portals in parallel
4. Deploy to Cloudflare Workers
5. Update custom domains automatically
6. ✅ Complete in ~3-5 minutes

### Manual Deployment

Via GitHub UI:
1. Go to Actions → Deploy Portals to Cloudflare Workers
2. Click "Run workflow"
3. Select branch (usually `main`)
4. Choose portal to deploy (or `all`)
5. Click "Run workflow"

Via GitHub CLI:
```bash
# Deploy all portals
gh workflow run deploy-portals.yml

# Deploy specific portal
gh workflow run deploy-portals.yml -f portal=student-portal
```

## 🔍 Monitoring Deployments

### View Workflow Runs

1. Go to repository → Actions tab
2. Click on "Deploy Portals to Cloudflare Workers"
3. View individual runs and logs

### Check Deployment Status

Each workflow run shows:
- ✅ Success (green check)
- ❌ Failure (red X)
- ⏸️ In progress (yellow circle)

### View Logs

Click on any workflow run to see:
- Build output
- Deployment logs
- Error messages (if any)
- Deployment summary

## ⚠️ Troubleshooting

### Issue 1: Authentication Failed

**Error**: `Error: Authentication error`

**Solution**: Check `CLOUDFLARE_API_TOKEN` is valid
```bash
# Test token locally
export CLOUDFLARE_API_TOKEN="your-token"
pnpm wrangler whoami
```

### Issue 2: Build Fails

**Error**: Build errors in GitHub Actions

**Solution**:
1. Test build locally first:
   ```bash
   cd apps/student-portal
   pnpm run build:cloudflare
   ```
2. Ensure all dependencies are in `package.json`
3. Check Node.js version matches (20.x)

### Issue 3: Deployment Timeout

**Error**: Workflow times out after 6 hours

**Solution**:
- Check Cloudflare status page
- Reduce build size
- Retry deployment manually

### Issue 4: Secrets Not Found

**Error**: `Error: Secret CLOUDFLARE_API_TOKEN not found`

**Solution**: Verify secrets are added to repository (not organization-level)

## 🔒 Security Best Practices

### Token Permissions

Use **minimum required permissions**:
- ✅ Workers Scripts: Edit
- ✅ Workers Routes: Edit
- ✅ DNS: Edit (for custom domains)
- ❌ Don't grant full account access

### Token Rotation

Rotate API tokens every 90 days:
1. Create new token in Cloudflare
2. Update GitHub secret
3. Test deployment
4. Revoke old token

### Branch Protection

Recommended settings for `main`:
- ✅ Require pull request before merging
- ✅ Require status checks to pass
- ✅ Require conversation resolution
- ✅ Include administrators

## 📈 Performance Optimization

### Cache Strategy

The workflow caches:
- ✅ pnpm store (faster dependency installation)
- ✅ Node.js modules
- ✅ Next.js build cache (implicit)

**Expected build times**:
- First run: 5-7 minutes
- Cached runs: 2-3 minutes

### Parallel Deployments

All portals deploy simultaneously:
```
┌─────────────────┐
│  GitHub Actions │
└────────┬────────┘
         │
    ┌────┴─────┬──────────────┬──────────────┐
    ▼          ▼              ▼              │
┌────────┐ ┌────────┐    ┌────────┐         │
│Student │ │Parent  │    │Teacher │         │
│Portal  │ │Portal  │    │Portal  │         │
└───┬────┘ └───┬────┘    └───┬────┘         │
    │          │              │              │
    ▼          ▼              ▼              │
┌──────────────────────────────────────┐    │
│   Cloudflare Workers (Global Edge)   │    │
└──────────────────────────────────────┘    │
                                             │
              ~3 minutes total ──────────────┘
```

## 🎯 Deployment Workflow Example

### Scenario: Bug Fix in Student Portal

```bash
# 1. Create feature branch
git checkout -b fix/login-button

# 2. Make changes
vim apps/student-portal/src/components/auth/login-form.tsx

# 3. Test locally
cd apps/student-portal
pnpm run build:cloudflare
pnpm run preview

# 4. Commit changes
git add .
git commit -m "Fix login button alignment"

# 5. Push to GitHub
git push origin fix/login-button

# 6. Create Pull Request
# - GitHub UI: Compare & pull request
# - Review changes
# - Merge to main

# 7. Automatic Deployment
# - GitHub Actions triggers on merge
# - Builds all portals
# - Deploys to Cloudflare
# - Updates live site (~3 minutes)

# 8. Verify
curl https://student.elymica.com
```

## 📅 Maintenance

### Weekly Tasks
- Review failed workflow runs
- Check deployment times
- Monitor Cloudflare analytics

### Monthly Tasks
- Rotate API tokens (if needed)
- Update workflow dependencies
- Review build cache efficiency

### Quarterly Tasks
- Audit workflow permissions
- Optimize build times
- Update GitHub Actions versions

## 🆘 Emergency Procedures

### Rollback Deployment

If a deployment breaks production:

**Option 1: Via Wrangler (Fastest)**
```bash
cd apps/student-portal
pnpm wrangler deployments list
pnpm wrangler rollback [PREVIOUS_VERSION_ID]
```

**Option 2: Revert Git Commit**
```bash
git revert HEAD
git push origin main
# Wait for automatic deployment (~3 minutes)
```

**Option 3: Manual Workflow Trigger**
```bash
# Deploy from previous commit
gh workflow run deploy-portals.yml --ref [PREVIOUS_COMMIT_SHA]
```

### Pause Deployments

Disable workflow temporarily:
1. Go to Actions → Deploy Portals
2. Click "..." (three dots)
3. Click "Disable workflow"

Re-enable when ready:
1. Go to Actions → Deploy Portals
2. Click "Enable workflow"

## 📊 Metrics & KPIs

Track these metrics for CI/CD health:

| Metric | Target | Current |
|--------|--------|---------|
| **Build Time** | < 3 min | TBD |
| **Success Rate** | > 95% | TBD |
| **Mean Time to Deploy** | < 5 min | TBD |
| **Rollback Frequency** | < 1/week | TBD |

## 🔗 Related Documentation

- [Main Deployment Guide](./DEPLOYMENT.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)

---

## ✅ Setup Checklist

Before enabling automated deployments:

- [ ] Add `CLOUDFLARE_API_TOKEN` to GitHub Secrets
- [ ] Add `CLOUDFLARE_ACCOUNT_ID` to GitHub Secrets
- [ ] Test workflow with manual trigger
- [ ] Verify all three portals deploy successfully
- [ ] Set up branch protection rules
- [ ] Document rollback procedure for team
- [ ] Configure failure notifications (optional)

---

*Last updated: 2025-11-20*
*CI/CD Stack: GitHub Actions, Wrangler 4.49.0, OpenNext Cloudflare 1.13.0*
