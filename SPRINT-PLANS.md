# Elymica Platform - Sprint Plans (Sprints 4-7)

**Planning Date:** November 20, 2025
**Sprint Duration:** 2 weeks per sprint
**Team Capacity:** Assumed 2 backend developers, 1 frontend developer, 1 QA
**Timeline:** 8 weeks total (Mid-November to Mid-January 2026)

---

## Sprint Overview

| Sprint | Dates | Focus Area | Key Deliverables |
|--------|-------|-----------|------------------|
| **Sprint 4** | Nov 20 - Dec 3 | Authentication & Tenant Context | Login, registration, OTP, tenant middleware |
| **Sprint 5** | Dec 4 - Dec 17 | Course Catalog & Enrollment | Course browsing, enrollment, roster management |
| **Sprint 6** | Dec 18 - Dec 31 | Learning Workflow | Assignments, submissions, grading, progress tracking |
| **Sprint 7** | Jan 1 - Jan 14 | Payments & Compliance | Payment integration, audit logging, launch prep |

---

## Sprint 4: Authentication & Tenant Context
**Dates:** November 20 - December 3, 2025 (2 weeks)
**Epic:** Authentication & User Management
**Sprint Goal:** Enable users to register, login, and securely access the platform with proper tenant isolation.

### Stories & Tasks

#### AUTH-1: Implement User Login
**Story:** As a user, I want to login with my email and password so I can access my portal.

**Tasks:**
1. **Backend (Auth Service - Port 8007):**
   - [ ] Create `POST /api/auth/login` endpoint
   - [ ] Validate credentials against `users` table (bcrypt comparison)
   - [ ] Query tenant metadata from `tenants` table
   - [ ] Generate JWT access token (15-min expiry) + refresh token (7-day expiry)
   - [ ] Store refresh token in `refresh_tokens` table with device fingerprint
   - [ ] Create audit log entry (login success/failure)
   - [ ] Return response: `{ accessToken, refreshToken, user, tenant }`
   - [ ] Handle error cases: invalid credentials (401), account locked (403), server error (500)

2. **Frontend (All Portals):**
   - [ ] Update login page to call `/api/auth/login`
   - [ ] Store access token in memory, refresh token in httpOnly cookie
   - [ ] Redirect to dashboard on successful login
   - [ ] Display error messages for failed login
   - [ ] Add loading state during authentication

3. **Testing:**
   - [ ] Unit tests: credential validation, token generation
   - [ ] Integration tests: end-to-end login flow
   - [ ] Security tests: SQL injection, brute force protection
   - [ ] E2E tests: Playwright login scenario

**Acceptance Criteria:**
- [ ] User can login with valid credentials and access dashboard
- [ ] Invalid credentials return 401 with clear error message
- [ ] Access token expires after 15 minutes
- [ ] Refresh token stored securely in httpOnly cookie
- [ ] Login attempts logged in audit table
- [ ] Account locked after 5 failed attempts (429 Too Many Requests)

**Story Points:** 8
**Assignee:** Backend Dev 1 + Frontend Dev
**Dependencies:** PostgreSQL `users`, `tenants`, `refresh_tokens` tables (already exist)

---

#### AUTH-2: Implement User Registration
**Story:** As a school admin, I want to create accounts for teachers, students, and parents via invitation so they can access the platform.

**Tasks:**
1. **Backend (Auth Service):**
   - [ ] Create `POST /api/auth/register` endpoint
   - [ ] Validate input: email format, password strength (min 8 chars, 1 uppercase, 1 number)
   - [ ] Check tenant limits (e.g., max 1000 users for Starter plan)
   - [ ] Hash password with bcrypt (10 rounds)
   - [ ] Insert user into `users` table with `email_verified: false`
   - [ ] Generate OTP (6-digit) and store in Redis (5-min expiry)
   - [ ] Call Notification Service to send OTP via email/SMS
   - [ ] Create default roles/permissions for user role
   - [ ] Return response: `{ userId, message: "OTP sent" }`

2. **Frontend (Admin Portal):**
   - [ ] Create user invitation form (email, name, role)
   - [ ] Bulk invitation (CSV upload)
   - [ ] Display OTP verification step
   - [ ] Show success/error messages

3. **Testing:**
   - [ ] Unit tests: input validation, password hashing
   - [ ] Integration tests: OTP generation and delivery
   - [ ] Security tests: XSS prevention, CSRF protection

**Acceptance Criteria:**
- [ ] Admin can create user accounts with role assignment
- [ ] User receives OTP via email/SMS within 30 seconds
- [ ] Duplicate email returns 409 Conflict
- [ ] Tenant limits enforced (403 Forbidden if exceeded)
- [ ] Weak passwords rejected with validation errors

**Story Points:** 13
**Assignee:** Backend Dev 2 + Backend Dev 1 (Notification Service integration)
**Dependencies:** Notification Service (Port 8023), SMS Service (Port 8022), Redis

---

#### AUTH-3: Implement OTP Verification & Token Refresh
**Story:** As a new user, I want to verify my email/phone with OTP so I can activate my account.

**Tasks:**
1. **Backend (Auth Service):**
   - [ ] Create `POST /api/auth/verify-otp` endpoint
   - [ ] Retrieve OTP from Redis using userId
   - [ ] Validate OTP matches input (case-insensitive, trim whitespace)
   - [ ] Update user: `email_verified: true` or `phone_verified: true`
   - [ ] Delete OTP from Redis
   - [ ] Return success response

   - [ ] Create `POST /api/auth/refresh` endpoint
   - [ ] Validate refresh token from request body/cookie
   - [ ] Query `refresh_tokens` table for matching token_hash
   - [ ] Check expiry (`expires_at > NOW()`) and revoked status
   - [ ] Generate new access token + refresh token (rotate)
   - [ ] Revoke old refresh token, insert new one
   - [ ] Return new tokens

2. **Frontend:**
   - [ ] OTP input component (6 digits, auto-submit)
   - [ ] Token refresh logic in API client (intercept 401, refresh, retry)
   - [ ] Logout on refresh failure

3. **Testing:**
   - [ ] Unit tests: OTP validation, token rotation
   - [ ] Security tests: expired OTP rejection, compromised token detection

**Acceptance Criteria:**
- [ ] User can verify OTP and activate account
- [ ] Invalid OTP returns 401 with error
- [ ] OTP expires after 5 minutes
- [ ] Access token auto-refreshes before expiry
- [ ] Old refresh tokens revoked after rotation

**Story Points:** 8
**Assignee:** Backend Dev 1
**Dependencies:** AUTH-1, AUTH-2, Redis

---

#### AUTH-4: Build Tenant Context Middleware
**Story:** As a platform, I want to enforce tenant isolation on all API requests so users can only access their tenant's data.

**Tasks:**
1. **Backend (API Gateway):**
   - [ ] Create `tenantContext` middleware
   - [ ] Extract JWT from `Authorization: Bearer <token>` header
   - [ ] Decode JWT, extract `tenant_id` + `user_id` claims
   - [ ] Compare JWT `tenant_id` with `x-tenant-id` header (if provided)
   - [ ] Reject cross-tenant requests with 403 Forbidden
   - [ ] Set PostgreSQL session variable: `SET app.current_tenant = '<tenant_id>'`
   - [ ] Attach `tenantId`, `userId`, `userRole` to request context
   - [ ] Generate correlation ID for distributed tracing

2. **Backend (All Services):**
   - [ ] Apply middleware to all protected routes
   - [ ] Update database queries to include `tenant_id` filter
   - [ ] Test RLS policies in PostgreSQL

3. **Testing:**
   - [ ] Unit tests: JWT decoding, tenant extraction
   - [ ] Security tests: cross-tenant access attempts (should fail)
   - [ ] Integration tests: verify RLS enforcement

**Acceptance Criteria:**
- [ ] All API requests include tenant context
- [ ] Cross-tenant requests return 403 Forbidden
- [ ] Database queries automatically filter by tenant
- [ ] Correlation IDs logged for tracing
- [ ] Missing/invalid JWT returns 401 Unauthorized

**Story Points:** 5
**Assignee:** Backend Dev 2
**Dependencies:** API Gateway configuration, PostgreSQL RLS policies

---

### Cross-Cutting Stories (Sprint 4)

#### OBS-1: Observability Baseline
**Story:** As a developer, I want structured logging and tracing so I can debug production issues.

**Tasks:**
- [ ] Install Pino logger in all services
- [ ] Configure Grafana Loki for log aggregation
- [ ] Add correlation IDs to all requests
- [ ] Create Grafana dashboard for auth service metrics
- [ ] Set up alerts: failed logins >100/min, API errors >5%

**Story Points:** 5
**Assignee:** Backend Dev 1

---

#### QA-1: Test Harness Scaffold
**Story:** As a QA engineer, I want automated tests for all API endpoints so I can verify functionality.

**Tasks:**
- [ ] Set up Vitest + Supertest for API testing
- [ ] Write test suite for AUTH-1 (login)
- [ ] Write test suite for AUTH-2 (registration)
- [ ] Configure GitHub Actions to run tests on PRs
- [ ] Add code coverage reporting (target: >80%)

**Story Points:** 5
**Assignee:** QA Engineer

---

### Sprint 4 Deliverables

**Demo Scenarios:**
1. Admin registers new student account
2. Student receives OTP via email, verifies account
3. Student logs in and sees dashboard
4. Session persists across tab refresh
5. Access token auto-refreshes after 15 minutes

**Metrics:**
- [ ] 100% of authentication endpoints tested
- [ ] <200ms P95 latency for login endpoint
- [ ] >99% login success rate (excluding invalid credentials)
- [ ] Zero cross-tenant data leaks

**Definition of Done:**
- [ ] Code merged to `main` branch
- [ ] Unit + integration tests passing in CI
- [ ] API documentation updated (OpenAPI spec)
- [ ] Grafana dashboard showing auth metrics
- [ ] Demo video recorded (Loom)

---

## Sprint 5: Course Catalog & Enrollment
**Dates:** December 4 - December 17, 2025 (2 weeks)
**Epic:** Learning Management System Core
**Sprint Goal:** Enable students to browse courses, enroll, and access learning materials.

### Stories & Tasks

#### LMS-1: Course Catalog API
**Story:** As a student, I want to browse available courses so I can enroll in classes I'm interested in.

**Tasks:**
1. **Backend (LMS Service - Port 8027):**
   - [ ] Create `GET /api/lms/courses` endpoint
   - [ ] Support pagination: `?page=1&limit=20`
   - [ ] Support filtering: `?subject=mathematics&grade=10`
   - [ ] Support sorting: `?sort=title&order=asc`
   - [ ] Query `courses` table with tenant isolation
   - [ ] Include instructor details (JOIN `users`)
   - [ ] Return response: `{ courses: [...], total, page, limit }`
   - [ ] Optimize with database indexes on `tenant_id`, `subject`, `grade_level`

   - [ ] Create `GET /api/lms/courses/:courseId` endpoint
   - [ ] Return course details + modules + enrollment status
   - [ ] Check if current user is enrolled

2. **Frontend (Student Portal):**
   - [ ] Update course catalog page with real API data
   - [ ] Implement pagination controls
   - [ ] Add search/filter UI
   - [ ] Display enrollment status badge

3. **Testing:**
   - [ ] Unit tests: query building, filtering logic
   - [ ] Performance tests: 1000 courses with <200ms latency
   - [ ] Integration tests: verify tenant isolation

**Acceptance Criteria:**
- [ ] Students see courses for their tenant only
- [ ] Pagination works correctly (no duplicate/missing courses)
- [ ] Filters return accurate results
- [ ] P95 latency <200ms with 1000 courses
- [ ] Teachers see courses they teach (additional filter)

**Story Points:** 8
**Assignee:** Backend Dev 1 + Frontend Dev
**Dependencies:** PostgreSQL `courses` table, tenant middleware (AUTH-4)

---

#### LMS-2: Content Delivery API
**Story:** As a student, I want to access course modules and lessons so I can learn.

**Tasks:**
1. **Backend (Content Service - Port 8026):**
   - [ ] Create `GET /api/content/modules/:courseId` endpoint
   - [ ] Return modules with lesson count, completion status
   - [ ] Order modules by sequence number

   - [ ] Create `GET /api/content/lessons/:moduleId` endpoint
   - [ ] Return lessons with metadata (video URL, PDF URL, duration)
   - [ ] Integrate with file storage (pre-signed S3 URLs for videos/PDFs)
   - [ ] Track lesson views in analytics service

2. **Frontend (Student Portal):**
   - [ ] Create module accordion component
   - [ ] Create lesson detail page
   - [ ] Implement video player (HLS.js for adaptive streaming)
   - [ ] PDF viewer (React-PDF)
   - [ ] Mark lesson as complete button

3. **Testing:**
   - [ ] Unit tests: pre-signed URL generation
   - [ ] E2E tests: student watches video, marks complete

**Acceptance Criteria:**
- [ ] Students access enrolled course content only
- [ ] Video streaming works on 3G connections (adaptive bitrate)
- [ ] PDF downloads work
- [ ] Lesson completion tracked

**Story Points:** 13
**Assignee:** Backend Dev 2 + Frontend Dev
**Dependencies:** S3/Backblaze file storage, LMS-1

---

#### ENR-1: Enrollment Workflow
**Story:** As a student, I want to enroll in courses so I can access learning materials.

**Tasks:**
1. **Backend (Enrollment Service - Port 8021):**
   - [ ] Create `POST /api/enrollment/enroll` endpoint
   - [ ] Validate prerequisite courses (if any)
   - [ ] Check seat limits (max students per course)
   - [ ] Insert enrollment record: `{ userId, courseId, status: 'enrolled', enrolledAt }`
   - [ ] Emit event to Notification Service (enrollment confirmation)
   - [ ] Return response: `{ enrollmentId, course }`

   - [ ] Create `GET /api/enrollment/my` endpoint
   - [ ] Return user's enrollments with course details
   - [ ] Include progress percentage (lessons completed / total lessons)

2. **Frontend (Student Portal + Parent Portal):**
   - [ ] "Enroll" button on course detail page
   - [ ] Enrollment confirmation modal
   - [ ] "My Courses" page showing enrollments
   - [ ] Parent can enroll children (select child dropdown)

3. **Testing:**
   - [ ] Unit tests: prerequisite validation, seat limit enforcement
   - [ ] Integration tests: enrollment flow end-to-end
   - [ ] Edge cases: double enrollment (idempotency), full course

**Acceptance Criteria:**
- [ ] Students enroll in courses with one click
- [ ] Prerequisites enforced (can't enroll in Algebra II without Algebra I)
- [ ] Seat limits respected (no over-enrollment)
- [ ] Parents enroll multiple children
- [ ] Enrollment confirmation sent via email/SMS

**Story Points:** 8
**Assignee:** Backend Dev 1 + Frontend Dev
**Dependencies:** LMS-1, Notification Service, tenant middleware

---

#### ENR-2: Class Roster for Teachers
**Story:** As a teacher, I want to see my class roster with student contact info so I can manage my classes.

**Tasks:**
1. **Backend (Enrollment Service):**
   - [ ] Create `GET /api/enrollment/roster/:courseId` endpoint
   - [ ] Verify requester is the course instructor (authorization check)
   - [ ] Query enrollments with JOINs: students, parents (guardians)
   - [ ] Return: `{ students: [{ id, name, email, parent: { name, phone, email } }] }`

2. **Frontend (Teacher Portal):**
   - [ ] Create class roster page
   - [ ] Display student list with contact info
   - [ ] Export roster as CSV
   - [ ] Search/filter students

3. **Testing:**
   - [ ] Security tests: verify only instructors can access roster
   - [ ] Integration tests: verify parent contact info included

**Acceptance Criteria:**
- [ ] Teachers access rosters for their courses only
- [ ] Roster includes student + parent contact info
- [ ] Roster export as CSV works
- [ ] Non-instructors get 403 Forbidden

**Story Points:** 5
**Assignee:** Backend Dev 2 + Frontend Dev
**Dependencies:** ENR-1, authorization middleware

---

### Sprint 5 Deliverables

**Demo Scenarios:**
1. Student browses course catalog, filters by subject
2. Student enrolls in "Introduction to Python" course
3. Student accesses course modules and watches video lesson
4. Parent enrolls 2 children in different courses
5. Teacher views class roster with parent contact info

**Metrics:**
- [ ] <200ms P95 latency for course listing
- [ ] Video streaming works on 3G (adaptive bitrate)
- [ ] 100% of enrollment endpoints tested
- [ ] Zero enrollment limit bypasses

**Definition of Done:**
- [ ] All stories completed and merged
- [ ] API documentation updated
- [ ] Frontend portals integrated with live APIs
- [ ] Demo video recorded

---

## Sprint 6: Learning Workflow (Assignments & Grading)
**Dates:** December 18 - December 31, 2025 (2 weeks)
**Epic:** Teaching & Assessment
**Sprint Goal:** Enable teachers to create assignments, students to submit, and teachers to grade.

### Stories & Tasks

#### ASSIGN-1: Assignment Creation & Distribution
**Story:** As a teacher, I want to create assignments and distribute them to my classes so students can submit work.

**Tasks:**
1. **Backend (Assignment Service - Port 8017):**
   - [ ] Create `POST /api/assignments` endpoint
   - [ ] Input: `{ courseId, title, description, dueDate, points, rubric, files[] }`
   - [ ] Validate due date (future), points (positive integer)
   - [ ] Upload files to S3/Backblaze, store URLs in database
   - [ ] Insert assignment record with `createdBy: teacherId`
   - [ ] Emit event to Notification Service (notify enrolled students)
   - [ ] Return: `{ assignmentId, assignment }`

   - [ ] Create `GET /api/assignments` endpoint
   - [ ] For students: return assignments for enrolled courses
   - [ ] For teachers: return assignments they created
   - [ ] Support filtering: `?status=pending&courseId=123`

2. **Frontend (Teacher Portal):**
   - [ ] Create assignment form (rich text editor for description)
   - [ ] File upload component (drag-and-drop)
   - [ ] Due date picker (calendar UI)
   - [ ] Assignment list page

   **Frontend (Student Portal):**
   - [ ] Assignment list page (upcoming, overdue, completed)
   - [ ] Assignment detail page

3. **Testing:**
   - [ ] Unit tests: input validation, file upload
   - [ ] Integration tests: notification sent to students
   - [ ] E2E tests: teacher creates assignment, student receives notification

**Acceptance Criteria:**
- [ ] Teachers create assignments in <5 minutes
- [ ] Assignments distributed to all enrolled students
- [ ] File uploads support PDF, DOCX, images (max 10MB)
- [ ] Students notified within 1 minute
- [ ] Due date validation (can't be in past)

**Story Points:** 13
**Assignee:** Backend Dev 1 + Frontend Dev
**Dependencies:** Content Service (file storage), Notification Service, ENR-1

---

#### ASSIGN-2: Assignment Submission
**Story:** As a student, I want to submit assignments with files so my teacher can grade my work.

**Tasks:**
1. **Backend (Assignment Service):**
   - [ ] Create `POST /api/assignments/:id/submit` endpoint
   - [ ] Input: `{ content: "text answer", files: [...] }`
   - [ ] Validate assignment exists and user is enrolled
   - [ ] Check deadline: mark `late: true` if after due date
   - [ ] Upload files to S3/Backblaze
   - [ ] Insert submission record: `{ assignmentId, userId, content, files, submittedAt, late }`
   - [ ] Generate submission receipt (confirmation number)
   - [ ] Emit event to Notification Service (notify teacher)
   - [ ] Return: `{ submissionId, receipt }`

   - [ ] Create `GET /api/assignments/:id/submissions` endpoint (teachers only)
   - [ ] Return submissions for assignment with student info

2. **Frontend (Student Portal):**
   - [ ] Submission form (text editor + file upload)
   - [ ] Submission confirmation modal (receipt number)
   - [ ] Resubmission allowed before deadline (if teacher enables)

   **Frontend (Teacher Portal):**
   - [ ] Submission inbox (list of submissions)
   - [ ] Submission detail view (student work + rubric)

3. **Testing:**
   - [ ] Unit tests: deadline validation, late flag
   - [ ] Integration tests: file upload, notification
   - [ ] E2E tests: student submits, teacher sees in inbox

**Acceptance Criteria:**
- [ ] Students submit assignments before/after deadline
- [ ] Late submissions clearly marked
- [ ] Files upload successfully (progress bar)
- [ ] Receipt generated with unique ID
- [ ] Teacher notified of new submission

**Story Points:** 8
**Assignee:** Backend Dev 2 + Frontend Dev
**Dependencies:** ASSIGN-1, file storage

---

#### GRADE-1: Grading Workflow
**Story:** As a teacher, I want to grade submissions with scores and feedback so students know their performance.

**Tasks:**
1. **Backend (Grading Service - Port 8018):**
   - [ ] Create `POST /api/grading/:submissionId` endpoint
   - [ ] Input: `{ score, maxScore, feedback, rubricScores: [{criterion, score}] }`
   - [ ] Validate score ≤ maxScore, feedback length
   - [ ] Insert grade record: `{ submissionId, graderId, score, feedback, rubricScores, gradedAt }`
   - [ ] Update submission status: `status: 'graded'`
   - [ ] Emit event to Notification Service (notify student + parent)
   - [ ] Return: `{ gradeId, grade }`

   - [ ] Create `GET /api/grading/pending` endpoint (teachers only)
   - [ ] Return ungraded submissions for teacher's courses

2. **Frontend (Teacher Portal):**
   - [ ] Grading interface (submission + rubric side-by-side)
   - [ ] Score input, feedback rich text editor
   - [ ] Save as draft / Publish grade
   - [ ] Grading queue (pending submissions)

   **Frontend (Student Portal + Parent Portal):**
   - [ ] Grade display (score, feedback, rubric breakdown)
   - [ ] Grade history (all assignments)

3. **Testing:**
   - [ ] Unit tests: score validation, rubric calculation
   - [ ] Integration tests: notification sent
   - [ ] E2E tests: teacher grades, student sees grade

**Acceptance Criteria:**
- [ ] Teachers grade submissions in <3 minutes
- [ ] Scores validated (can't exceed max)
- [ ] Feedback supports rich text (bold, lists)
- [ ] Students + parents notified within 1 minute
- [ ] Grade history shows all assignments

**Story Points:** 8
**Assignee:** Backend Dev 1 + Frontend Dev
**Dependencies:** ASSIGN-2, Notification Service

---

#### PROGRESS-1: Student Progress Dashboard
**Story:** As a student/parent, I want to see academic progress so I can track performance.

**Tasks:**
1. **Backend (Analytics Service - Port 8024):**
   - [ ] Create `GET /api/analytics/progress/:studentId` endpoint
   - [ ] Aggregate data from enrollments, assignments, grades
   - [ ] Calculate: course completion %, average grade per course, assignments pending
   - [ ] Return: `{ courses: [{ id, title, completion, avgGrade, assignmentsPending }] }`

   - [ ] Create `GET /api/analytics/attendance/:studentId` endpoint
   - [ ] Return attendance summary (if attendance tracking exists)

2. **Frontend (Student Portal):**
   - [ ] Dashboard widgets: course completion, grade trends, upcoming deadlines
   - [ ] Progress charts (Chart.js)

   **Frontend (Parent Portal):**
   - [ ] Multi-child progress overview
   - [ ] Grade trend indicators (improving/declining)

3. **Testing:**
   - [ ] Unit tests: calculation logic
   - [ ] Integration tests: data aggregation accuracy

**Acceptance Criteria:**
- [ ] Dashboards load in <2 seconds
- [ ] Progress calculations accurate to 99.9%
- [ ] Parents see all children on one screen
- [ ] Charts show 30-day trends

**Story Points:** 8
**Assignee:** Backend Dev 2 + Frontend Dev
**Dependencies:** ENR-1, ASSIGN-2, GRADE-1

---

### Cross-Cutting Stories (Sprint 6)

#### DOC-1: API Documentation
**Story:** As a developer, I want OpenAPI specs for all endpoints so I can integrate easily.

**Tasks:**
- [ ] Generate OpenAPI 3 specs from code (Swagger/Fastify decorators)
- [ ] Publish to `docs/api/` directory
- [ ] Host on Stoplight or Swagger UI
- [ ] Include example requests/responses

**Story Points:** 3
**Assignee:** Backend Dev 1

---

### Sprint 6 Deliverables

**Demo Scenarios:**
1. Teacher creates "Python Functions" assignment with PDF attachment
2. Student submits assignment with code file + text answer
3. Teacher grades submission with rubric, provides feedback
4. Student sees grade + feedback in portal
5. Parent sees updated grade on dashboard
6. Student dashboard shows course completion %

**Metrics:**
- [ ] <5 minutes to create + publish assignment
- [ ] <3 minutes to grade submission
- [ ] >99% notification delivery rate
- [ ] Zero data loss on file uploads

**Definition of Done:**
- [ ] All stories merged and tested
- [ ] API docs published
- [ ] Demo video recorded
- [ ] Performance tested (100 concurrent users)

---

## Sprint 7: Payments & Production Launch
**Dates:** January 1 - January 14, 2026 (2 weeks)
**Epic:** Revenue & Compliance
**Sprint Goal:** Enable tuition payments and prepare for production launch with pilot schools.

### Stories & Tasks

#### PAY-1: Payment Integration (Paystack + M-Pesa)
**Story:** As a parent, I want to pay tuition fees via mobile money or card so my child stays enrolled.

**Tasks:**
1. **Backend (Payment Service - Port 3017):**
   - [ ] Create `POST /api/payments/transactions` endpoint
   - [ ] Input: `{ amount, currency, method, metadata: { studentId, termId } }`
   - [ ] Validate payment method (mpesa, paystack, pesapal)
   - [ ] Generate idempotency key (prevent duplicates)
   - [ ] Call Paystack API: `POST /transaction/initialize`
   - [ ] Call M-Pesa API: STK Push
   - [ ] Store transaction record: `{ userId, amount, method, status: 'pending', transactionRef }`
   - [ ] Return: `{ transactionId, paymentUrl }` (redirect to Paystack) or `{ message: "Check your phone" }` (M-Pesa)

   - [ ] Create `POST /api/payments/webhooks/paystack` endpoint
   - [ ] Verify Paystack signature
   - [ ] Update transaction status: `status: 'success' | 'failed'`
   - [ ] Update enrollment status (if payment for enrollment)
   - [ ] Emit event to Notification Service (receipt email/SMS)
   - [ ] Return 200 OK

   - [ ] Create similar webhooks for M-Pesa, PesaPal

2. **Frontend (Parent Portal):**
   - [ ] Payment form (amount, method selector)
   - [ ] Paystack payment modal (iframe)
   - [ ] M-Pesa instructions (check phone)
   - [ ] Payment confirmation screen
   - [ ] Payment history page

3. **Testing:**
   - [ ] Unit tests: idempotency, webhook signature verification
   - [ ] Integration tests: Paystack sandbox, M-Pesa sandbox
   - [ ] E2E tests: parent pays, receives receipt

**Acceptance Criteria:**
- [ ] Parents initiate payments via Paystack or M-Pesa
- [ ] Payment success rate >95% (sandbox)
- [ ] Webhooks processed in <5 seconds
- [ ] Duplicate payments prevented (idempotency)
- [ ] Receipts sent within 30 seconds

**Story Points:** 13
**Assignee:** Backend Dev 2 + Frontend Dev
**Dependencies:** Paystack account, M-Pesa Daraja API credentials, Notification Service

---

#### PAY-2: Legacy Payment Gateway Migration
**Story:** As a platform, I want to migrate legacy PesaPal v3 integration so we support all African payment methods.

**Tasks:**
1. **Backend (Payment Service):**
   - [ ] Review legacy EduPay Gateway code (WordPress plugin)
   - [ ] Port PesaPal v3 API calls to Payment Service
   - [ ] Implement recurring billing logic
   - [ ] Implement partial payments (installments)
   - [ ] Store API keys encrypted in database (AES-256)
   - [ ] Create reconciliation endpoint: `GET /api/payments/reconciliation` (CSV export)

2. **Testing:**
   - [ ] Integration tests: PesaPal sandbox
   - [ ] Reconciliation report accuracy

**Acceptance Criteria:**
- [ ] PesaPal payments work end-to-end
- [ ] Recurring billing schedules correctly
- [ ] API keys encrypted at rest
- [ ] Reconciliation report matches actual transactions

**Story Points:** 13
**Assignee:** Backend Dev 1
**Dependencies:** PAY-1, legacy codebase review

---

#### COM-1: Compliance & Audit Logging
**Story:** As a school admin, I want audit logs and GDPR-compliant data export so we meet legal requirements.

**Tasks:**
1. **Backend (Admin Service - Port 8029):**
   - [ ] Create `GET /api/compliance/audit-log` endpoint
   - [ ] Query audit log table (filtered by tenant)
   - [ ] Support filtering: `?userId=123&action=login&startDate=...`
   - [ ] Return: `{ logs: [{ timestamp, userId, action, ipAddress, userAgent }] }`

   - [ ] Create `POST /api/compliance/data-export` endpoint
   - [ ] Create background job to export user data (JSON format)
   - [ ] Upload to S3/Backblaze, return download link
   - [ ] Delete export after 7 days

   - [ ] Create `POST /api/compliance/account-deletion` endpoint
   - [ ] Soft delete user (anonymize PII, keep audit logs)
   - [ ] Schedule hard delete after 30 days

2. **Frontend (Admin Portal):**
   - [ ] Audit log viewer (table with filters)
   - [ ] Data export button (download JSON)
   - [ ] Account deletion confirmation modal

3. **Testing:**
   - [ ] Unit tests: anonymization logic
   - [ ] Integration tests: data export completeness
   - [ ] Compliance tests: GDPR, POPIA requirements

**Acceptance Criteria:**
- [ ] Audit logs retained for 7 years
- [ ] Data export completes in <5 minutes
- [ ] Account deletion anonymizes PII immediately
- [ ] Hard delete after 30-day grace period

**Story Points:** 8
**Assignee:** Backend Dev 1
**Dependencies:** Audit log table, S3/Backblaze storage

---

#### SEC-1: Security Hardening
**Story:** As a platform, I want OWASP ASVS compliance so we're secure for production.

**Tasks:**
- [ ] Run OWASP ZAP security scan
- [ ] Fix identified vulnerabilities (SQL injection, XSS, CSRF)
- [ ] Enable Helmet.js headers (CSP, HSTS, X-Frame-Options)
- [ ] Rotate all secrets (JWT secret, database passwords, API keys)
- [ ] Store secrets in environment variables (not code)
- [ ] Enable rate limiting on all endpoints
- [ ] Configure CORS policies (whitelist frontend domains)
- [ ] Set up dependency scanning (Dependabot, Snyk)

**Story Points:** 8
**Assignee:** Backend Dev 2 + QA
**Dependencies:** All services deployed

---

#### PERF-1: Performance Testing & Optimization
**Story:** As a platform, I want to handle 1000 concurrent users so we can scale to 100 schools.

**Tasks:**
- [ ] Set up load testing (k6 or Artillery)
- [ ] Run tests: 1000 concurrent users, 10-minute duration
- [ ] Identify bottlenecks (slow queries, N+1 problems)
- [ ] Optimize:
  - [ ] Add database indexes (tenant_id, user_id, course_id)
  - [ ] Enable Redis caching for course listings
  - [ ] Configure PostgreSQL connection pooling
  - [ ] Enable gzip compression on API responses
- [ ] Re-run tests, verify P95 latency <200ms

**Story Points:** 5
**Assignee:** Backend Dev 1 + QA
**Dependencies:** All services deployed

---

### Sprint 7 Deliverables

**Demo Scenarios:**
1. Parent pays tuition via M-Pesa STK Push
2. Parent receives payment receipt via SMS + email
3. Admin views audit log (all login attempts)
4. Admin exports student data (GDPR request)
5. Performance test: 1000 concurrent users, <200ms latency

**Metrics:**
- [ ] Payment success rate >95%
- [ ] P95 latency <200ms under load
- [ ] Zero critical security vulnerabilities
- [ ] 100% audit log coverage

**Launch Readiness Checklist:**
- [ ] All API endpoints tested (unit + integration + E2E)
- [ ] Security audit passed (OWASP ASVS)
- [ ] Performance test passed (1000 concurrent users)
- [ ] Payment gateways activated (live keys)
- [ ] Monitoring dashboards configured
- [ ] Backup/restore tested
- [ ] Disaster recovery runbook documented
- [ ] 3 pilot schools signed

**Definition of Done:**
- [ ] All stories merged and deployed
- [ ] Production environment configured
- [ ] Pilot schools onboarded
- [ ] Demo to stakeholders completed

---

## Post-Sprint 7: Production Launch

### Week 1 (Jan 15-21): Pilot Launch
- [ ] Onboard 3 pilot schools (Nairobi, Lagos, Johannesburg)
- [ ] Train school admins (2-hour session)
- [ ] Monitor production dashboards (Grafana)
- [ ] Collect feedback (daily calls with pilot schools)
- [ ] Fix critical bugs (hotfixes)

### Week 2 (Jan 22-28): Stabilization
- [ ] Address pilot school feedback
- [ ] Optimize performance based on real usage
- [ ] Create customer support runbooks
- [ ] Prepare for wider launch (marketing, sales)

### Week 3 (Jan 29 - Feb 4): Wider Launch
- [ ] Announce platform availability
- [ ] Onboard 10-20 schools
- [ ] Scale infrastructure if needed
- [ ] Begin Sprint 8 planning (Phase 2 features)

---

## Sprint Ceremonies

**Daily Standup (15 minutes):**
- What did I complete yesterday?
- What am I working on today?
- Any blockers?

**Sprint Planning (2 hours, start of sprint):**
- Review sprint goal
- Break down stories into tasks
- Assign story points
- Commit to sprint backlog

**Sprint Review/Demo (1 hour, end of sprint):**
- Demo completed features to stakeholders
- Gather feedback
- Update product backlog

**Sprint Retrospective (1 hour, end of sprint):**
- What went well?
- What didn't go well?
- Action items for next sprint

---

## Risk Management

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| **Payment API downtime** | High | Medium | Test in sandbox first, implement retry logic |
| **Scope creep** | Medium | High | Strict story point limits, defer non-critical features |
| **Performance issues** | High | Medium | Load testing in Sprint 7, optimize early |
| **Team availability** | Medium | Medium | Cross-training, documentation |
| **Third-party API changes** | Low | Low | Monitor changelogs, version pin APIs |

---

## Success Metrics (Sprint 4-7)

**Velocity:**
- Target: 40-50 story points per sprint
- Actual: TBD (track in Jira/Linear)

**Quality:**
- Code coverage: >80%
- Bug escape rate: <5% (bugs found in production)
- P95 latency: <200ms

**Business:**
- Pilot schools onboarded: 3+
- Payment success rate: >95%
- User satisfaction (NPS): >50

---

**Document Owner:** Engineering Team
**Last Updated:** November 20, 2025
**Next Review:** End of Sprint 4 (December 3, 2025)
