# Elymica Backend Services - Deployment Plan

**Date:** 2025-11-20
**Status:** Ready for Execution
**Location:** `/home/jay/eduplatform-services`

---

## 📊 Executive Summary

The Elymica backend consists of **15 microservices** orchestrated with Docker Compose. Currently, the API Gateway on Cloudflare returns HTTP 502 because the underlying microservices are not running.

### Current Status

| Component | Status | Issue |
|-----------|--------|-------|
| **Frontend Portals** | ✅ Deployed | Running on Cloudflare Workers |
| **API Gateway** | ⚠️ Partially Working | Returns 200 on root, 502 on service routes |
| **Backend Services** | ❌ Not Running | Need to be started with Docker Compose |
| **Database** | ❓ Unknown | Need to verify PostgreSQL is running |
| **Redis** | ❓ Unknown | Need to verify Redis is running |

---

## 🏗️ Architecture Overview

### Service Inventory

**Infrastructure (2 services):**
1. **PostgreSQL** - Primary database (Port 5432)
2. **Redis** - Caching and session storage (Port 6379)

**Gateway & Core (2 services):**
3. **API Gateway** - Request routing, rate limiting (Port 8000)
4. **Auth Service** - Authentication, JWT tokens (Port 8007)

**Communication Services (4 services):**
5. **WebSocket Service** - Real-time communications (Port 8015)
6. **Search Service** - Full-text search (Port 8016)
7. **SMS Service** - OTP and notifications (Port 8022)
8. **Notification Service** - Email notifications (Port 8023)

**Learning Platform Services (6 services):**
9. **Assignment Service** - Homework and submissions (Port 8017)
10. **Grading Service** - Grade management (Port 8018)
11. **Scheduling Service** - Class schedules (Port 8019)
12. **Forum Service** - Discussion boards (Port 8020)
13. **Enrollment Service** - Course enrollments (Port 8021)
14. **LMS Service** - Learning management (Port 8027)

**Advanced Features (6 services):**
15. **Analytics Service** - Platform analytics (Port 8024)
16. **Reports Service** - Report generation (Port 8025)
17. **Content Service** - Course content (Port 8026)
18. **Integration Service** - Third-party integrations (Port 8028)
19. **Admin Service** - Admin operations (Port 8029)
20. **Admin Dashboard** - Admin UI (Port 3000)
21. **Certificate Service** - Certificate generation (Port 8030)

### Deployment Status (from docs)

According to [DEPLOYMENT-SUCCESS-REPORT.md:26](DEPLOYMENT-SUCCESS-REPORT.md#L26):
- **Before:** 20/21 services running
- **After:** 21/21 services running
- This was on a **Webuzo production server** (not Cloudflare)

### Service Dependencies

```
PostgreSQL (Must start first)
  ↓
Redis (Must start second)
  ↓
Auth Service → SMS Service
  ↓
API Gateway → All Services
  ↓
LMS Service → Certificate Service → Notification Service
```

---

## 🔍 Current Environment Analysis

### 1. Environment Variables

Location: [/home/jay/eduplatform-services/.env](/home/jay/eduplatform-services/.env)

**Configured:**
- ✅ Database credentials (PostgreSQL)
- ✅ JWT secret key
- ✅ Redis configuration
- ✅ Service URLs (internal Docker networking)
- ✅ Domain: elymica.com

**Not Configured (Using Console Provider):**
- ⚠️ SMS_PROVIDER=console (logs only, no real SMS)
- ⚠️ EMAIL_PROVIDER=console (logs only, no real emails)

### 2. Docker Compose Configuration

Location: [/home/jay/eduplatform-services/docker-compose.yml](/home/jay/eduplatform-services/docker-compose.yml)

**Key Findings:**
- All 21 services defined
- Health checks configured for PostgreSQL and Redis
- All services use custom Dockerfiles
- Services depend on database being healthy
- Network: `eduplatform-network` (bridge)

### 3. Database Initialization

Location: [/home/jay/eduplatform-services/init-db.sql](/home/jay/eduplatform-services/init-db.sql)

**Automated Setup:**
- ✅ Creates `tenants` table
- ✅ Creates `users` table with RLS (Row Level Security)
- ✅ Creates `refresh_tokens` table
- ✅ Creates default admin tenant (slug: 'admin')
- ✅ Creates default admin user: `admin@elymica.com` / `admin123`

**Other tables created automatically** by services on first request (auto-migration).

---

## 🚀 Deployment Strategy

### Option A: Local Development Deployment (Recommended First)

Run all services locally on your development machine to verify everything works.

**Advantages:**
- Easy debugging
- Can see logs directly
- No server configuration needed
- Fast iteration

**Steps:** See Section 1 below

### Option B: Deploy to Existing Webuzo Server

According to docs, there's an existing production deployment at **199.192.22.106**.

**Advantages:**
- Already has deployment history
- Services were running there before
- Can use existing scripts

**Considerations:**
- Need SSH access
- May need to update services
- Check if it's still active

**Steps:** See Section 2 below

### Option C: Deploy to New Cloud Server (Cloudflare Workers Compatible)

Deploy backend to a cloud provider that can route to Cloudflare Workers.

**Options:**
- Digital Ocean Droplet ($6/month)
- AWS EC2 t3.micro (free tier)
- Hetzner Cloud CX11 (€3.79/month)
- Cloudflare Workers (requires refactoring to serverless)

**Steps:** See Section 3 below

---

## 📋 Deployment Steps

## SECTION 1: Local Development Deployment

### Step 1: Verify Prerequisites

```bash
cd /home/jay/eduplatform-services

# Check Docker is installed and running
docker --version
docker compose version

# Should show:
# Docker version 24.x.x
# Docker Compose version v2.x.x

# Check Docker daemon is running
docker ps
```

### Step 2: Check Environment Configuration

```bash
# Review .env file
cat .env

# Verify critical variables are set:
# - JWT_SECRET (should be long random string)
# - POSTGRES_PASSWORD (strong password)
# - Database settings
```

### Step 3: Start Infrastructure Services First

```bash
# Start PostgreSQL and Redis only
docker compose up -d postgres redis

# Wait for them to be healthy (should take 10-30 seconds)
docker compose ps

# Check logs
docker compose logs postgres
docker compose logs redis

# Verify health
docker compose exec postgres pg_isready -U eduplatform
# Should return: postgres:5432 - accepting connections

docker compose exec redis redis-cli ping
# Should return: PONG
```

### Step 4: Verify Database Initialization

```bash
# Connect to database
docker compose exec postgres psql -U eduplatform -d eduplatform

# Check tables were created
\dt

# Should show:
#  public | refresh_tokens | table | eduplatform
#  public | tenants        | table | eduplatform
#  public | users          | table | eduplatform

# Check default admin user
SELECT email, role FROM users WHERE role = 'super_admin';

# Should show: admin@elymica.com | super_admin

# Exit
\q
```

### Step 5: Start Core Services

```bash
# Start auth service
docker compose up -d auth-service

# Wait 10 seconds then check logs
docker compose logs auth-service

# Verify auth service is running
curl http://localhost:8007/health

# Should return: {"status":"ok","service":"auth-service"}
```

### Step 6: Start All Services

```bash
# Start all remaining services
docker compose up -d

# Check status
docker compose ps

# All services should show "Up" or "Up (healthy)"
```

### Step 7: Verify All Services Are Running

```bash
# Run the verification script
cd /home/jay/eduplatform-services
./verify-enhancements.sh

# Or manually test each service
curl http://localhost:8007/health  # Auth Service
curl http://localhost:8027/health  # LMS Service
curl http://localhost:8023/health  # Notification Service
curl http://localhost:8030/health  # Certificate Service
```

### Step 8: Test API Gateway

```bash
# Test gateway root
curl http://localhost:8000

# Should return gateway info

# Test proxied route
curl http://localhost:8000/api/auth/health

# Should return auth service health
```

### Step 9: Check Service Logs

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f lms-service
docker compose logs -f auth-service

# Check for errors
docker compose logs | grep -i error
docker compose logs | grep -i fail
```

### Step 10: Test End-to-End Flow

Create a test script to verify the complete flow:

```bash
#!/bin/bash
# test-backend-flow.sh

echo "Testing backend services..."

# 1. Test auth service
echo "1. Testing auth service..."
AUTH_HEALTH=$(curl -s http://localhost:8007/health)
echo "   Auth health: $AUTH_HEALTH"

# 2. Test LMS service
echo "2. Testing LMS service..."
LMS_HEALTH=$(curl -s http://localhost:8027/health)
echo "   LMS health: $LMS_HEALTH"

# 3. Test certificate service
echo "3. Testing certificate service..."
CERT_HEALTH=$(curl -s http://localhost:8030/health)
echo "   Certificate health: $CERT_HEALTH"

# 4. Test notification service
echo "4. Testing notification service..."
NOTIF_HEALTH=$(curl -s http://localhost:8023/health)
echo "   Notification health: $NOTIF_HEALTH"

echo ""
echo "✅ Backend services are responding!"
```

---

## SECTION 2: Deploy to Existing Webuzo Server

### Prerequisites

Based on [DEPLOYMENT-SUCCESS-REPORT.md](/home/jay/eduplatform-services/DEPLOYMENT-SUCCESS-REPORT.md):
- **Server:** 199.192.22.106
- **SSH User:** desgvjox
- **SSH Key:** ~/.ssh/webuzo_id_rsa

### Step 1: Verify Server Access

```bash
# Test SSH connection
ssh -i ~/.ssh/webuzo_id_rsa desgvjox@199.192.22.106

# Check if services directory exists
ls -la ~/eduplatform-services

# Check if services are running
docker compose ps

# Exit
exit
```

### Step 2: Sync Latest Changes

```bash
cd /home/jay/eduplatform-services

# Use existing sync script
./update-production.sh

# Or manually sync with rsync
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  -e "ssh -i ~/.ssh/webuzo_id_rsa" \
  /home/jay/eduplatform-services/ \
  desgvjox@199.192.22.106:~/eduplatform-services/
```

### Step 3: Deploy Services on Server

```bash
# SSH to server
ssh -i ~/.ssh/webuzo_id_rsa desgvjox@199.192.22.106

# Navigate to services directory
cd ~/eduplatform-services

# Pull latest Docker images (if needed)
docker compose pull

# Start all services
docker compose up -d

# Check status
docker compose ps

# Verify all services are running
./verify-enhancements.sh
```

### Step 4: Configure DNS for Backend API

You need to point `api.elymica.com` to the backend server.

**Option A: Direct Server Access**
```bash
# Add A record in Cloudflare DNS
# api.elymica.com → 199.192.22.106
```

**Option B: Via Cloudflare Workers (Recommended)**
Create a Cloudflare Worker to proxy backend requests:

```javascript
// api-proxy-worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const backendUrl = 'http://199.192.22.106:8000' + url.pathname + url.search;

    return fetch(backendUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
  }
}
```

---

## SECTION 3: Deploy to New Cloud Server

### Recommended: Digital Ocean Droplet

**Specs:**
- **Droplet Size:** Basic Droplet - $6/month
- **RAM:** 1 GB
- **CPU:** 1 vCPU
- **Storage:** 25 GB SSD
- **OS:** Ubuntu 22.04 LTS
- **Region:** Choose closest to target users (e.g., Frankfurt for African latency)

### Step 1: Create Droplet

```bash
# Using doctl CLI (DigitalOcean CLI)
doctl compute droplet create elymica-backend \
  --size s-1vcpu-1gb \
  --image ubuntu-22-04-x64 \
  --region fra1 \
  --ssh-keys YOUR_SSH_KEY_ID

# Or use web UI: https://cloud.digitalocean.com/droplets/new
```

### Step 2: SSH to Server and Install Docker

```bash
# SSH to new server
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version

# Create non-root user
adduser elymica
usermod -aG docker elymica
usermod -aG sudo elymica

# Switch to new user
su - elymica
```

### Step 3: Transfer Files to Server

```bash
# On your local machine
cd /home/jay/eduplatform-services

# Create tarball
tar -czf eduplatform-services.tar.gz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '*.log' \
  .

# Copy to server
scp eduplatform-services.tar.gz elymica@YOUR_DROPLET_IP:~/

# SSH to server
ssh elymica@YOUR_DROPLET_IP

# Extract
tar -xzf eduplatform-services.tar.gz
cd eduplatform-services
```

### Step 4: Configure Environment

```bash
# Review and update .env file
nano .env

# Update these values:
# NODE_ENV=production
# DOMAIN=elymica.com
# POSTGRES_PASSWORD=[change to strong password]
# JWT_SECRET=[change to new secret]
```

### Step 5: Start Services

```bash
cd ~/eduplatform-services

# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 6: Configure Firewall

```bash
# Allow HTTP, HTTPS, SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp  # API Gateway

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 7: Point DNS to New Server

```bash
# In Cloudflare DNS, add A record:
# api.elymica.com → YOUR_DROPLET_IP
```

---

## 🧪 Testing & Verification

### Verification Checklist

Run through this checklist after deployment:

```bash
# 1. Infrastructure Health
□ PostgreSQL is running and healthy
□ Redis is running and healthy
□ Database has tables created
□ Default admin user exists

# 2. Core Services
□ Auth service responds on /health
□ API Gateway responds on /health
□ Can authenticate with test user

# 3. Learning Services
□ LMS service responds
□ Assignment service responds
□ Enrollment service responds

# 4. Communication Services
□ Notification service responds
□ SMS service responds (console mode OK)
□ WebSocket service responds

# 5. Advanced Services
□ Certificate service responds
□ Analytics service responds
□ Reports service responds

# 6. Integration Tests
□ Can register new user
□ Can create course
□ Can enroll in course
□ Can complete course
□ Certificate auto-generated
□ Notification sent (console log OK)
```

### Automated Verification Script

```bash
#!/bin/bash
# verify-deployment.sh

echo "🔍 Verifying Elymica Backend Deployment"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BACKEND_URL="${1:-http://localhost:8000}"

# Test services
services=(
  "8007:auth-service"
  "8027:lms-service"
  "8023:notification-service"
  "8030:certificate-service"
  "8017:assignment-service"
  "8018:grading-service"
  "8019:scheduling-service"
  "8020:forum-service"
  "8021:enrollment-service"
  "8024:analytics-service"
  "8025:reports-service"
  "8026:content-service"
)

passed=0
failed=0

for service in "${services[@]}"; do
  port="${service%%:*}"
  name="${service##*:}"

  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}/health" 2>/dev/null)

  if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ ${name}${NC} (port ${port})"
    ((passed++))
  else
    echo -e "${RED}❌ ${name}${NC} (port ${port}) - Status: ${status}"
    ((failed++))
  fi
done

echo ""
echo "========================================"
echo "Results: ${passed} passed, ${failed} failed"

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✅ All services are healthy!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some services are not responding${NC}"
  exit 1
fi
```

---

## 🔗 Connecting Frontend to Backend

### Current Frontend Configuration

The frontend portals are configured to use:
```typescript
NEXT_PUBLIC_API_BASE_URL: "https://api.elymica.com"
AUTH_SERVICE_BASE_URL: "https://auth.elymica.com"
```

### Required DNS Configuration

Add these DNS records in Cloudflare:

| Record Type | Name | Value | Proxy Status |
|-------------|------|-------|--------------|
| A | api.elymica.com | [Backend Server IP] | Proxied ✅ |
| A | auth.elymica.com | [Backend Server IP] | Proxied ✅ |

### OR: Use API Gateway Routing

Alternative: Route through API Gateway

**Update frontend to use single endpoint:**
```typescript
NEXT_PUBLIC_API_BASE_URL: "https://api.elymica.com"
```

**API Gateway routes all services:**
- `https://api.elymica.com/api/auth/*` → auth-service:8007
- `https://api.elymica.com/api/lms/*` → lms-service:8027
- `https://api.elymica.com/api/courses/*` → content-service:8026
- etc.

---

## 🚨 Troubleshooting

### Issue 1: Services Not Starting

```bash
# Check Docker logs
docker compose logs [service-name]

# Common issues:
# - Port already in use
# - Database not healthy
# - Missing environment variables
```

**Solution:**
```bash
# Check port availability
netstat -tulpn | grep 8000

# Restart with fresh state
docker compose down -v
docker compose up -d
```

### Issue 2: Database Connection Errors

```bash
# Check PostgreSQL is running
docker compose exec postgres pg_isready

# Check logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U eduplatform -d eduplatform
```

**Solution:**
```bash
# Recreate database volume
docker compose down -v
docker compose up -d postgres
# Wait 30 seconds for initialization
```

### Issue 3: Services Return 502

**Cause:** Service is running but not responding to requests

```bash
# Check service health endpoint
curl http://localhost:8007/health

# Check service logs for errors
docker compose logs auth-service | grep -i error

# Restart specific service
docker compose restart auth-service
```

### Issue 4: Authentication Fails

```bash
# Check JWT secret is set
docker compose exec auth-service env | grep JWT_SECRET

# Check database has users
docker compose exec postgres psql -U eduplatform -d eduplatform -c \
  "SELECT email, role FROM users LIMIT 5;"

# Test auth endpoint
curl -X POST http://localhost:8007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "00000000-0000-0000-0000-000000000001",
    "email": "admin@elymica.com",
    "password": "admin123"
  }'
```

---

## 📊 Cost Analysis

### Local Development
- **Cost:** $0
- **Performance:** Fast (local)
- **Scalability:** Limited
- **Use Case:** Development and testing

### Digital Ocean Droplet
- **Cost:** $6/month
- **Performance:** Good (dedicated resources)
- **Scalability:** Manual (resize droplet)
- **Use Case:** Small production deployment

### AWS/GCP/Azure
- **Cost:** $10-50/month (depending on usage)
- **Performance:** Excellent
- **Scalability:** Auto-scaling available
- **Use Case:** Large production deployment

### Recommended Approach
1. **Start with Local** - Verify everything works
2. **Deploy to $6 Droplet** - Test with real users
3. **Scale as Needed** - Upgrade when you hit limits

---

## 🎯 Success Criteria

After deployment, you should have:

- ✅ All 15 microservices running and healthy
- ✅ PostgreSQL database initialized with tables
- ✅ Redis caching layer operational
- ✅ API Gateway routing requests correctly
- ✅ Authentication working (can login users)
- ✅ Frontend portals can communicate with backend
- ✅ No 502 errors on API calls
- ✅ Health checks passing on all services

---

## 📅 Next Steps After Deployment

### Immediate (Within 24 hours)
1. Test user registration and login
2. Test course enrollment
3. Test certificate generation
4. Monitor service logs for errors

### Short Term (Within 1 week)
1. Configure real SMTP for email notifications
2. Set up monitoring and alerting
3. Configure automated backups
4. Load testing

### Medium Term (Within 1 month)
1. Migrate payment gateway (PesaPal, Paystack, M-Pesa)
2. Set up CI/CD for backend services
3. Implement rate limiting
4. Security audit

---

## 📞 Support Resources

### Documentation
- [DEPLOYMENT_GUIDE.md](/home/jay/eduplatform-services/DEPLOYMENT_GUIDE.md)
- [DEPLOYMENT-SUCCESS-REPORT.md](/home/jay/eduplatform-services/DEPLOYMENT-SUCCESS-REPORT.md)
- [docker-compose.yml](/home/jay/eduplatform-services/docker-compose.yml)

### Verification Scripts
- `verify-enhancements.sh` - Test all services
- `check-platform-health.sh` - Health checks
- `run-all-tests.sh` - Integration tests

### Deployment Scripts
- `update-production.sh` - Sync to production server
- `deploy-to-webuzo.sh` - Deploy to Webuzo server

---

**Deployment Plan Created:** 2025-11-20
**Next Action:** Choose deployment option (Local, Webuzo, or Cloud) and begin execution
