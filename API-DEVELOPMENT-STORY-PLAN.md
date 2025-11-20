# Elymica API Development Story Plan

**Target Duration:** 4–6 weeks  
**Objective:** Deliver the minimum backend API surface required for the three production portals to authenticate, fetch tenant-specific content, enroll learners, manage assignments, and observe progress.

---

## Epic 1 – Authentication & Tenant Context (Week 1)

| Story | Description | Acceptance Criteria | Dependencies |
|-------|-------------|---------------------|---------------|
| **AUTH-1** | Implement `POST /api/auth/login` that validates tenant + user credentials, issues JWT + refresh token, and records audit trail. | - Returns access + refresh tokens and tenant metadata<br>- Invalid credentials produce 401 with problem+json<br>- Refresh token stored with device fingerprint<br>- Audit log row persisted | PostgreSQL `users`, `tenants`, `refresh_tokens` tables |
| **AUTH-2** | Implement `POST /api/auth/register` to create tenant admin accounts (invitation-based). | - Enforces tenant limits + RLS<br>- Sends verification email/OTP via notification service<br>- Creates default roles + permissions | Notification service, Redis |
| **AUTH-3** | Implement `POST /api/auth/verify-otp` + `POST /api/auth/refresh`. | - OTP verification toggles `is_verified` flag<br>- Refresh rotates tokens + revokes compromised sessions | AUTH-1, AUTH-2 |
| **AUTH-4** | Build shared `tenant-context` middleware for downstream services. | - Extracts `x-tenant-id` + user claims<br>- Rejects cross-tenant requests with 403<br>- Emits trace IDs for observability | API Gateway config |

**Deliverables:** Auth service code, database migrations, Postman collection, MSW mocks, automated tests (unit + integration), portal env updates to hit live API.

---

## Epic 2 – Course Catalog & Enrollment (Week 2)

| Story | Description | Acceptance Criteria | Dependencies |
|-------|-------------|---------------------|---------------|
| **LMS-1** | `GET /api/lms/courses` and `GET /api/lms/courses/:courseId` | - Supports pagination, filtering by subject/grade<br>- Honors tenant isolation<br>- 200ms P95 latency with seeded data | Tenant middleware, content service |
| **LMS-2** | `GET /api/content/modules/:courseId` + `GET /api/content/lessons/:moduleId` | - Returns lesson metadata + streaming URLs<br>- Integrates with object storage adapter (mock for now) | Content service |
| **ENR-1** | `POST /api/enrollment/enroll` + `GET /api/enrollment/my` | - Validates prerequisites + seat counts<br>- Emits enrollment events to notification service<br>- Parent portal can enroll dependents | Auth tokens, LMS-1 |
| **ENR-2** | `GET /api/enrollment/roster/:courseId` for teachers | - Scoped to teacher’s assignments<br>- Includes guardian contact info for messaging queue | ENR-1 |

**Deliverables:** Updated Prisma/SQL migrations, TanStack Query hooks wired to live endpoints, seed scripts for demo tenant.

---

## Epic 3 – Learning Workflow (Week 3)

| Story | Description | Acceptance Criteria | Dependencies |
|-------|-------------|---------------------|---------------|
| **ASSIGN-1** | `POST /api/assignments` for teachers to publish assignments, plus `GET /api/assignments` for students/parents. | - Supports file attachments (pre-signed URLs)<br>- Sends notifications to enrolled learners<br>- Enforces schedule windows | Content service, notification service |
| **ASSIGN-2** | `POST /api/assignments/:id/submit` | - Accepts uploads + text answers<br>- Generates submission receipt<br>- Validates deadline windows | ASSIGN-1 |
| **GRADE-1** | `POST /api/grading/:submissionId` + `GET /api/grading/pending` | - Teachers can grade + leave feedback<br>- Parents view feedback summary<br>- Stores rubric + numeric score | Assignments |
| **PROGRESS-1** | `GET /api/analytics/progress` and `GET /api/analytics/attendance` | - Aggregates assignments + enrollments per student<br>- Feeds dashboards without additional joins client-side | Enrollment, grading services |

**Deliverables:** Event schema for notifications, Grafana panel updates, contract tests between services.

---

## Epic 4 – Payments & Compliance (Week 4)

| Story | Description | Acceptance Criteria | Dependencies |
|-------|-------------|---------------------|---------------|
| **PAY-1** | Integrate Paystack and M-Pesa STK push for tuition payments. | - `POST /api/payments/transactions` initiates payment<br>- Webhooks update enrollment status<br>- Duplicates prevented via idempotency keys | Enrollment service |
| **PAY-2** | Migrate legacy PesaPal v3 logic into dedicated payment service. | - Supports recurring billing + receipts<br>- Encrypts API keys at rest<br>- Provides reconciliation CSV export | PAY-1 |
| **COM-1** | Implement audit logging & GDPR-compliant data export endpoints. | - `GET /api/compliance/audit-log` scoped by tenant<br>- Data export jobs stored in S3/Backblaze<br>- Admin dashboard link to downloads | Completed auth + enrollment |

**Deliverables:** Payment service container, QA checklist for regulators, staged webhooks in Cloudflare Tunnel, load/perf test scripts.

---

## Cross-Cutting Stories (All Weeks)

1. **OBS-1 – Observability Baseline**: Standardize structured logging (pino) and ship to Grafana Loki; include correlation IDs across services.
2. **QA-1 – Test Harness**: Add Vitest + Supertest suites for each service covering new endpoints, contract tests via Pact for API Gateway.
3. **SEC-1 – Hardening**: OWASP ASVS review, Vault or SSM for secrets, automated dependency scanning in CI.
4. **DOC-1 – API Reference**: Publish OpenAPI 3 specs generated from source + host via Stoplight in `docs/api`.

---

## Suggested Sprint Breakdown

- **Sprint 1:** AUTH-1 → AUTH-4, OBS-1 foundation, QA-1 scaffold. Demo: login + refresh working from student portal hitting prod API.
- **Sprint 2:** LMS-1, LMS-2, ENR-1, ENR-2. Demo: browse catalog, enroll student, view roster.
- **Sprint 3:** ASSIGN-1/2, GRADE-1, PROGRESS-1, DOC-1 updates. Demo: teacher creates assignment, student submits, parent sees progress.
- **Sprint 4:** PAY-1/2, COM-1, SEC-1 closure, performance test. Demo: live payment via sandbox, compliance export ready.

---

## Pre-Work Checklist

- [ ] Finalize API contracts per service and copy into repo (`docs/api-contracts/`)
- [ ] Ensure docker-compose images expose hot-reload ports for rapid iteration
- [ ] Seed demo tenant data (courses, users) for end-to-end QA
- [ ] Update CI pipeline to run contract tests + publish artifacts on merge
- [ ] Align frontend env vars with live endpoints before QA

---

## Definition of Done (per story)

1. Endpoint implemented with validation, authorization, telemetry.
2. Unit + integration tests passing in CI, contract updated.
3. Observability dashboards updated with new metrics.
4. Documentation + runbooks updated.
5. Demo scenario recorded (Loom or written steps) showing portal interaction.

This plan delivers a production-ready API surface while keeping the existing infrastructure untouched. Adjust story sizing or sprint cadence based on team capacity.
