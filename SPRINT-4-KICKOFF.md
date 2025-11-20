# Sprint 4 Kickoff – Authentication & Tenant Context

**Sprint Window:** 20 Nov – 3 Dec 2025 (10 working days)  
**Team Capacity:** 2 backend devs (20 pts), 1 frontend dev (12 pts), 1 QA (12 pts)  
**Committed Points:** 44 (matches plan baseline)  
**Goal:** Ship production-ready authentication workflow (login, registration, OTP, refresh) with enforced tenant isolation and initial observability/test harness.

---

## 1. Objectives & Success Criteria

1. Users authenticate end-to-end from live portals using Auth service over Cloudflare Tunnel.  
2. Multi-tenant isolation enforced at gateway/service/database layers, preventing cross-tenant data access.  
3. Structured logging + tracing available for Auth & Gateway with dashboards + alerts.  
4. Automated test harness (Vitest + Supertest) covers critical auth flows and runs in CI.  
5. Demo on 3 Dec: admin invites teacher, teacher verifies OTP, logs in, refresh token rotates automatically.

**KPIs:**  
- Auth endpoints ≤200 ms P95 from Lagos test region.  
- <0.1% failed logins due to system errors during testing.  
- Zero known cross-tenant access violations.  
- 90%+ code coverage on Auth service modules touched this sprint.

---

## 2. Committed Stories

| ID | Story | Owner | Points | Dependencies | Notes |
|----|-------|-------|--------|--------------|-------|
| AUTH-1 | User login (JWT + refresh tokens) | Backend Dev 1 + Frontend Dev | 8 | Existing DB tables | Aligns with API-DEVELOPMENT-STORY-PLAN Epic 1 |
| AUTH-2 | User registration + OTP dispatch | Backend Dev 2 | 13 | Notification + SMS svc, Redis | Requires seeded SMTP/SMS credentials |
| AUTH-3 | OTP verification + token refresh | Backend Dev 1 | 8 | AUTH-1, AUTH-2, Redis | Ensure refresh rotation + revocation |
| AUTH-4 | Tenant context middleware + RLS enforcement | Backend Dev 2 | 5 | API Gateway config, DB RLS | Touch all downstream services |
| OBS-1 | Observability baseline (Pino → Loki, Grafana panel) | Backend Dev 1 | 5 | Loki + Grafana running | Create alert rules |
| QA-1 | Test harness (Vitest, Supertest, Playwright scenario) | QA + Frontend Dev | 5 | Auth endpoints | Gate CI merges |

**Stretch Items (pull only if velocity allows):**
- Harden rate limiting (Auth service)  
- Add Sentry instrumentation at gateway

---

## 3. Backlog Breakdown

### AUTH-1 Tasks
- Implement `/api/auth/login` route with bcrypt, JWT issuance, refresh token persistence.
- Add audit logging hook.
- Frontend: update login form to call live API, handle errors, store tokens.
- Tests: unit (credential validation), integration (DB + Redis), Playwright (portal login).

### AUTH-2 Tasks
- `/api/auth/register` input validation, tenant quota checks, OTP generation.
- Wire Notification + SMS services using existing message queue topic.
- Admin portal invite form + CSV bulk upload stub.
- Tests + rate limiting (5 invites/min per admin).

### AUTH-3 Tasks
- `/api/auth/verify-otp` with Redis lookup + user flag update.
- `/api/auth/refresh` with rotation + revocation.
- Frontend interceptor to auto-refresh + logout on failure.

### AUTH-4 Tasks
- API Gateway middleware hooking into express pipeline.
- Propagate tenant context via headers (`x-tenant-id`, `x-request-id`).
- Database session variable + enforcement tests.

### OBS-1 Tasks
- Add Pino logger + request context binding.
- Ship logs to Loki (docker compose pipeline) and Grafana dashboard with auth metrics.
- Alerts for failed logins spike, OTP failures, 5xx rate.

### QA-1 Tasks
- Vitest + Supertest suites living under `services/auth/tests`.
- CI pipeline update (pnpm test:auth).
- Playwright spec for login + refresh path.

---

## 4. Dependencies & Pre-Work Checklist

- ✅ Databases seeded (`users`, `tenants`, `refresh_tokens`) per Deployment reports.  
- ✅ Cloudflare Tunnel live for API endpoints.  
- ❗ Configure SMTP/API creds for Notification + SMS services in `.env` before AUTH-2.  
- ❗ Ensure Redis persistence enabled (check docker compose) for OTP storage.  
- ❗ Confirm Loki datasource added to Grafana (OBS-1).  
- ❗ Align portal `.env` with production API base URLs prior to QA sign-off.

---

## 5. Milestones & Ceremonies

- **Sprint Planning:** 20 Nov (done via this kickoff).  
- **Daily Standup:** 09:00 EAT (Slack huddle + async note).  
- **Mid-sprint Sync:** 27 Nov – focus on OBS/QA readiness.  
- **Demo & Retro:** 3 Dec (auth flow demo, post-mortem).  
- **Release Cut:** Immediately after demo upon QA sign-off.

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Notification/SMS credentials unavailable | Blocks AUTH-2 OTP delivery | Use sandbox provider temporarily + capture manual code path |
| Redis latency/availability issues | OTP verification failures | Add retry logic + monitoring; ensure persistence/replication |
| Tenant middleware regression across services | Potential downtime | Stage rollout using feature flag + smoke tests per service |
| Testing infrastructure flakiness | CI instability | Run tests inside Docker compose service, pin dependencies |

---

## 7. Definition of Done (Sprint Level)

1. All committed stories meet acceptance criteria + merged to main.  
2. CI green, new tests added for each endpoint.  
3. Grafana dashboards + alerts operational.  
4. Demo script executed successfully against production backend via portals.  
5. Documentation updated (API reference, runbooks, changelog).

---

**Action Items to Start Today**
- [ ] Backend Dev 1: scaffold auth service modules + logging (AUTH-1).  
- [ ] Backend Dev 2: review tenant middleware requirements + DB policies (AUTH-4 prep).  
- [ ] Frontend Dev: point portals at prod API + implement token handling.  
- [ ] QA: set up Vitest/Supertest harness repository structure.  
- [ ] PM: Schedule mid-sprint sync + demo slot, circulate kickoff doc to stakeholders.

Let’s build and ship! 🚀
