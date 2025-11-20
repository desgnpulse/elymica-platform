# Elymica Platform - Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** November 20, 2025
**Document Owner:** Product Team
**Status:** Active Development

---

## 1. Executive Summary

### 1.1 Product Overview

**Elymica** is a multi-tenant, cloud-based Learning Management System (LMS) designed specifically for African educational institutions, serving K-12 schools, tertiary institutions, and educational publishers across the continent.

**Vision:** To democratize access to quality education technology across Africa by providing a scalable, affordable, and locally-optimized learning platform.

**Mission:** Deliver a comprehensive education platform that handles curriculum delivery, student assessment, parent engagement, teacher workflows, and payment processing—all optimized for African internet infrastructure and payment ecosystems.

### 1.2 Market Opportunity

**Target Markets:**
- **Primary:** K-12 private schools in Kenya, Nigeria, South Africa, Ghana
- **Secondary:** Tertiary institutions (universities, colleges)
- **Tertiary:** Educational publishers and content creators

**Market Size:**
- 300M+ school-age children in Sub-Saharan Africa
- 60%+ private school enrollment in urban areas
- $20B+ education technology market (projected 2025)

**Competitive Advantage:**
- Edge-optimized for African latency (Lagos 20-30ms, Nairobi 30-50ms)
- Native payment integration (M-Pesa, Paystack, PesaPal)
- Multi-tenant architecture (100+ institutions per deployment)
- Offline-first capabilities for intermittent connectivity
- Culturally-adapted UX (Sahara-Japandi design system)

### 1.3 Success Metrics (Year 1)

| Metric | Target | Current Status |
|--------|--------|---------------|
| **Active Institutions** | 50+ | 0 (Pre-launch) |
| **Monthly Active Students** | 10,000+ | 0 (Pre-launch) |
| **Payment Success Rate** | >95% | N/A |
| **Platform Uptime** | 99.5%+ | 100% (Infrastructure) |
| **Average Response Time (Africa)** | <100ms | 20-50ms (Achieved) |
| **NPS Score** | >50 | N/A |

---

## 2. User Personas

### 2.1 Primary Personas

#### Persona 1: Student (Ages 10-18)
**Name:** Amina (15, Grade 10, Nairobi)

**Background:**
- Attends private secondary school in Nairobi
- Uses smartphone (Android) for learning
- Internet access: 3G/4G data, limited WiFi at home
- Learning style: Visual learner, prefers video content

**Goals:**
- Access course materials anytime, anywhere
- Submit assignments before deadlines
- Track grades and progress
- Communicate with teachers
- Prepare for national exams (KCSE)

**Pain Points:**
- Slow internet connection during peak hours
- Confusion about assignment deadlines
- Limited feedback on submitted work
- No visibility into overall academic progress

**User Stories:**
- "I want to download course materials when I have WiFi so I can study offline later"
- "I want to see all my upcoming assignments in one place so I don't miss deadlines"
- "I want instant notifications when teachers grade my work"

---

#### Persona 2: Parent/Guardian
**Name:** Obi (42, Parent of 3, Lagos)

**Background:**
- Father of 3 children (ages 8, 12, 16) in private schools
- Works full-time, limited availability during school hours
- Pays tuition fees monthly via mobile money
- Wants visibility into children's academic performance

**Goals:**
- Monitor all children's academic progress from one dashboard
- Pay tuition fees securely and conveniently
- Communicate with teachers when needed
- Receive alerts about attendance or academic issues
- Understand where children need extra support

**Pain Points:**
- Difficult to track 3 children across different grade levels
- Manual payment processes (bank transfers, cash)
- Limited communication channels with teachers
- No early warning system for declining performance

**User Stories:**
- "I want to pay tuition for all 3 children in one transaction using M-Pesa"
- "I want to see a weekly summary of each child's grades and attendance"
- "I want to schedule parent-teacher meetings without calling the school"

---

#### Persona 3: Teacher
**Name:** Mrs. Wanjiku (35, Mathematics Teacher, Nairobi)

**Background:**
- Teaches 4 classes (120+ students total)
- 10 years teaching experience
- Tech-comfortable but limited training on digital tools
- Spends 15+ hours/week grading assignments manually

**Goals:**
- Streamline assignment distribution and collection
- Reduce time spent on grading and record-keeping
- Provide timely feedback to students
- Identify struggling students early
- Communicate with parents efficiently

**Pain Points:**
- Managing paper assignments from 120 students
- Time-consuming manual grading
- Difficulty tracking which students submitted assignments
- No centralized system for recording grades
- Parent communication requires multiple phone calls

**User Stories:**
- "I want to create and distribute assignments to all 4 classes in under 5 minutes"
- "I want to grade assignments with rubrics and provide written feedback digitally"
- "I want to see which students are consistently missing deadlines"
- "I want to notify parents immediately when their child is struggling"

---

#### Persona 4: School Administrator
**Name:** Dr. Mbeki (52, Principal, Johannesburg)

**Background:**
- Principal of 800-student private school
- Manages 45 teaching staff
- Responsible for P&L, regulatory compliance
- Budget-conscious, needs cost-effective solutions

**Goals:**
- Centralized visibility into school operations
- Reduce administrative overhead
- Ensure compliance with education regulations
- Improve parent satisfaction and retention
- Make data-driven decisions about curriculum and staffing

**Pain Points:**
- Disconnected systems (finance, academics, HR)
- Manual reporting for regulatory bodies
- High administrative costs
- Limited insights into student outcomes
- Parent complaints about communication gaps

**User Stories:**
- "I want to see real-time enrollment, attendance, and financial metrics on one dashboard"
- "I want to generate compliance reports (GDPR, local regulations) automatically"
- "I want to identify at-risk students before they fail or drop out"

---

### 2.2 Secondary Personas

#### Persona 5: Content Publisher
**Name:** EduCorp Africa (Content Provider)

**Goals:**
- Distribute digital curriculum to schools
- Track content usage and engagement
- License content to multiple institutions
- Receive royalty payments automatically

---

## 3. Product Features & Requirements

### 3.1 Feature Categorization

Features are categorized using MoSCoW prioritization:
- **Must Have (M):** Critical for MVP launch
- **Should Have (S):** Important but not launch-blocking
- **Could Have (C):** Nice to have, defer to v2
- **Won't Have (W):** Out of scope for v1

---

### 3.2 Core Features

#### 3.2.1 Authentication & User Management (M)

**Requirements:**
- Multi-tenant user authentication (email + password, OTP via SMS)
- Role-based access control (Student, Parent, Teacher, Admin, Super Admin)
- Session management with JWT tokens (15-min access, 7-day refresh)
- Password reset via email/SMS OTP
- Two-factor authentication (2FA) for admin roles
- Account lockout after 5 failed login attempts
- Audit logging for all authentication events

**Acceptance Criteria:**
- User can register and verify email/phone within 2 minutes
- Login success rate >99.5%
- Session remains active across tab refreshes
- Tenant isolation enforced (no cross-tenant data leaks)

**API Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-otp`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/password-reset`

**Dependencies:**
- PostgreSQL (users, tenants, refresh_tokens tables)
- Redis (OTP cache, session storage)
- SMS Service (OTP delivery)

---

#### 3.2.2 Course Catalog & Enrollment (M)

**Requirements:**
- Hierarchical course structure (Courses → Modules → Lessons)
- Course metadata (title, description, grade level, subject, instructor)
- Prerequisite enforcement (e.g., Algebra I required before Algebra II)
- Seat limits per course (e.g., max 30 students per class)
- Enrollment workflows:
  - Student self-enrollment (if enabled by admin)
  - Bulk enrollment by admin
  - Parent enrollment on behalf of children
- Enrollment status tracking (enrolled, completed, dropped)
- Course search and filtering (by subject, grade, teacher)

**Acceptance Criteria:**
- Students can browse and enroll in eligible courses
- Parents can enroll multiple children in different courses
- Teachers see accurate class rosters with guardian contact info
- Enrollment limits enforced (no over-enrollment)
- P95 latency <200ms for course listing

**API Endpoints:**
- `GET /api/lms/courses` (list courses with pagination, filters)
- `GET /api/lms/courses/:id` (course details)
- `GET /api/content/modules/:courseId` (course modules)
- `GET /api/content/lessons/:moduleId` (lesson content)
- `POST /api/enrollment/enroll` (enroll in course)
- `GET /api/enrollment/my` (user's enrollments)
- `GET /api/enrollment/roster/:courseId` (class roster for teachers)

**Dependencies:**
- LMS Service (Port 8027)
- Content Service (Port 8026)
- Enrollment Service (Port 8021)
- Notification Service (Port 8023) - enrollment confirmation

---

#### 3.2.3 Assignment Workflow (M)

**Requirements:**
- Assignment creation by teachers (title, description, due date, points, rubric)
- File attachments (PDF, DOCX, images) via pre-signed URLs
- Assignment distribution to one or more classes
- Submission workflow:
  - Text answers
  - File uploads (max 10MB per file, 5 files per submission)
  - Submission receipts (timestamp, confirmation number)
- Deadline enforcement (late submission warnings)
- Resubmission allowed before deadline (teacher configurable)
- Notifications:
  - Students: new assignment published
  - Parents: assignment due soon (24h before)
  - Teachers: new submission received

**Acceptance Criteria:**
- Teachers create and publish assignments in <5 minutes
- Students submit assignments with confirmation receipt
- Late submissions clearly marked in grading queue
- File uploads succeed on 3G connections (optimistic upload)
- Parents notified if child misses deadline

**API Endpoints:**
- `POST /api/assignments` (create assignment)
- `GET /api/assignments` (list assignments for student/teacher)
- `GET /api/assignments/:id` (assignment details)
- `POST /api/assignments/:id/submit` (submit assignment)
- `GET /api/assignments/:id/submissions` (view submissions)

**Dependencies:**
- Assignment Service (Port 8017)
- Content Service (Port 8026) - file storage
- Notification Service (Port 8023)

---

#### 3.2.4 Grading & Feedback (M)

**Requirements:**
- Grading interface for teachers:
  - View submissions side-by-side with rubric
  - Numeric score entry (0-100 or custom point scale)
  - Written feedback (rich text editor)
  - Rubric-based grading (criteria + scores)
- Grading queue (pending → graded)
- Grade visibility:
  - Students see grades + feedback after teacher publishes
  - Parents see summary of all children's grades
- Grade statistics (class average, distribution)
- Grade history (track revisions if teacher updates grade)

**Acceptance Criteria:**
- Teachers grade assignments in <3 minutes per submission
- Students receive notification when grade is published
- Parents see updated grades within 1 minute
- Grade changes audit-logged

**API Endpoints:**
- `POST /api/grading/:submissionId` (submit grade + feedback)
- `GET /api/grading/pending` (teacher's grading queue)
- `GET /api/grading/student/:studentId` (student's grades)
- `GET /api/grading/class/:courseId/stats` (class statistics)

**Dependencies:**
- Grading Service (Port 8018)
- Assignment Service (Port 8017)
- Notification Service (Port 8023)

---

#### 3.2.5 Progress Tracking & Analytics (M)

**Requirements:**
- Student dashboard:
  - Course completion percentage
  - Average grade per course
  - Upcoming assignments/deadlines
  - Attendance summary
- Parent dashboard:
  - Multi-child progress overview
  - Grade trends (improving/declining indicators)
  - Attendance alerts
  - Recent activity feed
- Teacher dashboard:
  - Class performance overview
  - At-risk students (late submissions, low grades)
  - Grading workload (pending submissions)
- Admin dashboard:
  - School-wide enrollment statistics
  - Teacher workload distribution
  - Financial metrics (payments, outstanding fees)

**Acceptance Criteria:**
- Dashboards load in <2 seconds
- Data refreshes in real-time (no manual refresh needed)
- Progress calculations accurate to 99.9%
- At-risk students flagged within 24 hours of trigger event

**API Endpoints:**
- `GET /api/analytics/progress/:studentId` (student progress)
- `GET /api/analytics/attendance/:studentId` (attendance data)
- `GET /api/analytics/class/:courseId` (class analytics)
- `GET /api/analytics/school` (school-wide metrics)

**Dependencies:**
- Analytics Service (Port 8024)
- Enrollment, Assignment, Grading services (data sources)

---

#### 3.2.6 Payment Processing (M)

**Requirements:**
- Payment methods:
  - **M-Pesa STK Push** (Kenya) - mobile money
  - **Paystack** (Nigeria, Ghana, South Africa) - card payments
  - **PesaPal v3** (Kenya, Tanzania, Uganda) - multi-channel
- Payment workflows:
  - One-time tuition payments
  - Recurring billing (monthly, quarterly, annual)
  - Partial payments (installment plans)
- Payment receipts (PDF download + email)
- Payment history (transaction log per parent account)
- Reconciliation:
  - Admin dashboard for payment tracking
  - CSV export for accounting systems
- Idempotency (prevent duplicate charges)
- Webhook handling for async payment confirmation

**Acceptance Criteria:**
- Payment success rate >95%
- Payment confirmation delivered within 30 seconds
- Failed payments retried automatically (3 attempts)
- Webhook processing <5 seconds
- Receipt generated immediately after successful payment

**API Endpoints:**
- `POST /api/payments/transactions` (initiate payment)
- `GET /api/payments/transactions/:id` (payment status)
- `GET /api/payments/history` (user's payment history)
- `POST /api/payments/webhooks/mpesa` (M-Pesa callback)
- `POST /api/payments/webhooks/paystack` (Paystack webhook)
- `POST /api/payments/webhooks/pesapal` (PesaPal IPN)
- `GET /api/payments/receipts/:id` (download receipt PDF)

**Dependencies:**
- Payment Service (Port 3017)
- Enrollment Service (status updates after payment)
- Notification Service (payment receipts via email/SMS)
- External APIs: M-Pesa, Paystack, PesaPal

**Migration Required:**
- Legacy EduPay Gateway (WordPress plugin) → New Payment Service
- Estimated effort: 4 weeks

---

#### 3.2.7 Communication & Notifications (S)

**Requirements:**
- Notification channels:
  - In-app notifications (real-time via WebSocket)
  - Email notifications (transactional)
  - SMS notifications (critical alerts only)
- Notification types:
  - Assignment published
  - Grade published
  - Payment received/failed
  - Attendance alert (absence)
  - System announcements
- Messaging:
  - Teacher → Student (1:1, 1:many)
  - Teacher → Parent (1:1)
  - Parent → Teacher (1:1)
  - Admin → All users (broadcast)
- Message threading (replies grouped)
- Read receipts
- Notification preferences (opt-in/opt-out per channel)

**Acceptance Criteria:**
- In-app notifications appear within 1 second
- Email notifications delivered within 5 minutes
- SMS notifications delivered within 30 seconds
- Message delivery rate >99%
- Users can mute notification types

**API Endpoints:**
- `GET /api/notifications` (fetch notifications)
- `POST /api/notifications/:id/read` (mark as read)
- `POST /api/messages` (send message)
- `GET /api/messages/threads/:userId` (conversation thread)
- `GET /api/messages/threads/:userId/messages` (messages in thread)

**Dependencies:**
- Notification Service (Port 8023)
- WebSocket Service (Port 8015)
- SMS Service (Port 8022) - Twilio integration
- Email Service (Port 3005) - SMTP integration

---

#### 3.2.8 Compliance & Data Security (M)

**Requirements:**
- **Data Residency:** All African customer data stored in African AWS regions (Cape Town, Johannesburg)
- **Encryption:**
  - At rest: AES-256 (database, file storage)
  - In transit: TLS 1.3 (all API calls)
- **GDPR Compliance:**
  - Right to access (data export)
  - Right to erasure (account deletion)
  - Consent management (terms acceptance)
  - Data processing agreements (DPAs)
- **Local Regulations:**
  - Kenya Data Protection Act 2019
  - Nigeria Data Protection Regulation 2019
  - South Africa POPIA
- **Audit Logging:**
  - All authentication events
  - Data access (who viewed what, when)
  - Data modifications (who changed what, when)
  - Admin actions (user creation, role changes)
- **Backup & Recovery:**
  - Daily automated backups (retained 30 days)
  - Point-in-time recovery (24-hour RPO)
  - Disaster recovery plan (4-hour RTO)

**Acceptance Criteria:**
- Data export completes in <5 minutes for typical user
- Account deletion removes all PII within 30 days
- Audit logs retained for 7 years
- Backup restoration tested quarterly

**API Endpoints:**
- `GET /api/compliance/audit-log` (view audit log)
- `POST /api/compliance/data-export` (request data export)
- `POST /api/compliance/account-deletion` (request account deletion)
- `GET /api/compliance/data-export/:jobId` (download export)

**Dependencies:**
- Compliance Service (Port 8029 - Admin Service)
- PostgreSQL (audit logging)
- S3/Backblaze (backup storage)

---

### 3.3 Feature Roadmap

#### Phase 1: MVP (Current Sprint - Weeks 1-6)
**Goal:** Minimum viable product for pilot schools

**Features:**
- ✅ Frontend portals deployed (Student, Parent, Teacher)
- ⏳ Authentication & user management (AUTH-1 to AUTH-4)
- ⏳ Course catalog & enrollment (LMS-1, LMS-2, ENR-1, ENR-2)
- ⏳ Assignment workflow (ASSIGN-1, ASSIGN-2)
- ⏳ Grading & feedback (GRADE-1)
- ⏳ Progress tracking (PROGRESS-1)
- ⏳ Payment processing (PAY-1, PAY-2)
- ⏳ Compliance & audit logging (COM-1)

**Success Criteria:**
- 3-5 pilot schools onboarded
- 500+ active students
- >95% payment success rate
- <100ms P95 latency in Africa

---

#### Phase 2: Feature Completion (Weeks 7-12)
**Goal:** Feature parity with competitors + African-specific enhancements

**Features:**
- Video content delivery (HLS streaming, adaptive bitrate)
- Quiz builder (multiple choice, short answer, auto-grading)
- Certificate generation (course completion, graduation)
- Forum/discussion boards (peer learning)
- Calendar integration (assignment deadlines, events)
- Mobile app (React Native, iOS + Android)
- Offline mode (sync when online)
- Parent-teacher conference scheduling
- Report card generation (PDF export)

**Success Criteria:**
- 20+ active schools
- 5,000+ active students
- NPS score >50
- Mobile app: 10,000+ downloads

---

#### Phase 3: Scale & Marketplace (Months 4-6)
**Goal:** Scale to 100+ schools, launch content marketplace

**Features:**
- Content marketplace (publishers can sell courses)
- Multi-language support (English, Swahili, French, Afrikaans)
- White-label option (schools can customize branding)
- Advanced analytics (predictive insights, ML-powered recommendations)
- Integration API (Zapier, Google Classroom, Microsoft Teams)
- Live classes (Zoom/Jitsi integration)
- AI teaching assistant (chatbot for student support)

**Success Criteria:**
- 100+ active schools
- 25,000+ active students
- 10+ content publishers
- $500K+ ARR

---

## 4. Technical Architecture

### 4.1 System Architecture

**Architecture Pattern:** Microservices + Edge-Optimized Frontend

```
┌─────────────────────────────────────────────────────┐
│                 User's Browser                      │
└─────────────────┬───────────────────────────────────┘
                  │ HTTPS
                  ↓
┌─────────────────────────────────────────────────────┐
│         Cloudflare Edge Network (Global CDN)        │
│  • DDoS Protection                                  │
│  • SSL/TLS Termination                              │
│  • Rate Limiting                                     │
│  • Edge Locations: Lagos (20-30ms), Nairobi (30ms) │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ↓                    ↓
┌───────────────┐   ┌────────────────────┐
│ Frontend      │   │ Cloudflare Tunnel  │
│ Workers       │   │ (Encrypted)        │
│ (Next.js 14)  │   └─────────┬──────────┘
└───────────────┘             │
                              ↓
                   ┌──────────────────────┐
                   │ Backend Server       │
                   │ (Webuzo / AWS)       │
                   │                      │
                   │ API Gateway:8000     │
                   │ Auth Service:8007    │
                   │ 21 Microservices     │
                   │                      │
                   │ PostgreSQL:5432      │
                   │ Redis:6379           │
                   └──────────────────────┘
```

---

### 4.2 Technology Stack

#### Frontend
- **Framework:** Next.js 14.2.12 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 4 + Sahara-Japandi design tokens
- **State:** TanStack Query 5 (server) + Zustand (local UI)
- **Auth:** NextAuth 4.24.13
- **Deployment:** Cloudflare Workers (OpenNext 1.13.0)

#### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Fastify 4.x (microservices)
- **Language:** TypeScript 5.3
- **ORM:** Prisma 5.x
- **Validation:** Zod 3.x
- **Orchestration:** Docker Compose
- **API Gateway:** Custom Fastify gateway (Port 8000)

#### Infrastructure
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Storage:** AWS S3 / Backblaze B2
- **CDN:** Cloudflare (Global)
- **Monitoring:** Prometheus + Grafana + Loki
- **CI/CD:** GitHub Actions
- **Hosting:** Cloudflare Workers (Frontend), Webuzo/AWS (Backend)

#### Payments
- **M-Pesa:** Safaricom M-Pesa STK Push API
- **Paystack:** Card payments, bank transfers
- **PesaPal:** Multi-channel (card, mobile money, bank)

---

### 4.3 Data Model (Simplified)

**Core Entities:**

```sql
-- Tenants (Schools/Institutions)
tenants (id, name, slug, domain, status, settings, created_at)

-- Users (Students, Parents, Teachers, Admins)
users (id, tenant_id, email, password_hash, name, role, status, created_at)

-- Courses
courses (id, tenant_id, title, description, grade_level, subject, instructor_id, created_at)

-- Enrollments
enrollments (id, tenant_id, user_id, course_id, status, enrolled_at, completed_at)

-- Assignments
assignments (id, tenant_id, course_id, title, description, due_date, points, created_by, created_at)

-- Submissions
submissions (id, assignment_id, user_id, content, files, submitted_at, late)

-- Grades
grades (id, submission_id, grader_id, score, feedback, graded_at)

-- Payments
payments (id, tenant_id, user_id, amount, currency, method, status, transaction_ref, created_at)
```

**Tenant Isolation:**
- All tables include `tenant_id` foreign key
- Row Level Security (RLS) enforced in PostgreSQL
- API middleware validates `x-tenant-id` header on every request

---

### 4.4 Security

**Authentication:**
- JWT access tokens (15-min expiry)
- Refresh tokens (7-day expiry, stored in PostgreSQL)
- Secure httpOnly cookies (frontend)
- Device fingerprinting (prevent token theft)

**Authorization:**
- Role-Based Access Control (RBAC)
- Roles: Student, Parent, Teacher, Admin, Super Admin
- Permissions checked at API Gateway + service level

**Encryption:**
- TLS 1.3 (all API traffic)
- AES-256 (database at rest)
- Secrets managed via environment variables (Docker, Cloudflare Workers)

**Rate Limiting:**
- API Gateway: 100 requests/min per user
- Authentication endpoints: 5 requests/min
- Payment endpoints: 10 requests/min

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Target | Rationale |
|--------|--------|-----------|
| **P95 Latency (Africa)** | <100ms | Optimized for Lagos, Nairobi, Johannesburg |
| **Page Load Time** | <2s | Acceptable on 3G connections |
| **API Response Time** | <200ms | Fast enough for real-time UX |
| **Concurrent Users** | 10,000+ | Support 100 schools × 100 concurrent users |
| **Database Queries** | <50ms | Indexed queries, read replicas |

### 5.2 Scalability

| Metric | Target | Strategy |
|--------|--------|----------|
| **Horizontal Scaling** | 100+ schools | Multi-tenant architecture, DB sharding |
| **Vertical Scaling** | 25,000+ students | Cloudflare Workers (auto-scale), Redis cache |
| **Storage Growth** | 1TB+/year | S3/Backblaze (infinite scale) |

### 5.3 Availability

| Metric | Target | Strategy |
|--------|--------|----------|
| **Uptime SLA** | 99.5% | Cloudflare DDoS protection, DB backups |
| **RTO (Recovery Time)** | 4 hours | Automated failover, runbooks |
| **RPO (Data Loss)** | 24 hours | Daily backups, point-in-time recovery |

### 5.4 Reliability

| Metric | Target | Strategy |
|--------|--------|----------|
| **Payment Success Rate** | >95% | Retry logic, webhook idempotency |
| **API Error Rate** | <1% | Structured error handling, monitoring |
| **Data Integrity** | 99.99% | ACID transactions, RLS |

---

## 6. Business Requirements

### 6.1 Pricing Model

**B2B SaaS (Per-Institution Pricing):**

| Tier | Schools | Students | Price/Month | Features |
|------|---------|----------|-------------|-----------|
| **Starter** | Small schools | Up to 100 | $50 | Core LMS, 1 admin, email support |
| **Growth** | Medium schools | 101-500 | $150 | + Payments, analytics, 3 admins |
| **Enterprise** | Large schools | 501-2,000 | $400 | + White-label, API access, dedicated support |
| **Custom** | Universities | 2,000+ | Custom | + SLA, on-premise option, training |

**Revenue Projections (Year 1):**
- 20 Starter + 15 Growth + 10 Enterprise + 5 Custom = $7,500/mo × 12 = **$90K ARR**

**Payment Gateway Revenue Share:**
- Transaction fee: 2.5% + $0.10 per payment (pass-through from M-Pesa/Paystack)
- Elymica fee: 0.5% on payments processed through platform

### 6.2 Go-to-Market Strategy

**Phase 1: Pilot Program (Months 1-3)**
- Target: 5 pilot schools in Nairobi + Lagos
- Offer: 3 months free, dedicated onboarding
- Goal: Validate product-market fit, gather feedback

**Phase 2: Direct Sales (Months 4-6)**
- Hire 2 sales reps (Kenya + Nigeria)
- Target: 20 schools via outbound sales
- Channel: Direct outreach, education conferences

**Phase 3: Partner Network (Months 7-12)**
- Partner with education consultants, school networks
- Referral program: 20% recurring commission
- Target: 50+ schools via partners

**Phase 4: Content Marketplace (Year 2)**
- Launch marketplace for publishers
- Revenue share: 70% publisher, 30% Elymica
- Target: 10 publishers, 100+ courses

---

## 7. Dependencies & Risks

### 7.1 External Dependencies

| Dependency | Risk Level | Mitigation |
|------------|-----------|------------|
| **M-Pesa API** | High | Sandbox testing, fallback to Paystack |
| **Paystack API** | Medium | Multi-region redundancy |
| **Cloudflare** | Low | 99.99% SLA, DDoS protection |
| **AWS/Webuzo** | Medium | Automated backups, DR plan |

### 7.2 Key Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| **Payment API downtime** | High | Medium | Retry logic, fallback providers |
| **Low school adoption** | High | Medium | Pilot program, referral incentives |
| **Regulatory changes** | Medium | Low | Legal counsel, compliance monitoring |
| **Competitor launch** | Medium | High | Speed to market, differentiation (Africa focus) |
| **Intermittent connectivity** | High | High | Offline mode, optimistic UI |

---

## 8. Success Criteria & KPIs

### 8.1 Product KPIs (Tracked Weekly)

**Engagement:**
- Daily Active Users (DAU) / Monthly Active Users (MAU) ratio
- Average session duration (target: >10 minutes)
- Feature adoption rate (% users using assignments, payments, etc.)

**Performance:**
- P95 API latency (target: <100ms)
- Payment success rate (target: >95%)
- Uptime (target: 99.5%)

**Business:**
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Churn rate (target: <5% monthly)

### 8.2 Launch Readiness Checklist

**Technical:**
- [ ] All API endpoints implemented and tested
- [ ] End-to-end testing passed (auth → enrollment → payment)
- [ ] Load testing: 1,000 concurrent users
- [ ] Security audit completed (OWASP ASVS)
- [ ] Monitoring dashboards configured (Grafana)
- [ ] Backup/restore tested
- [ ] Disaster recovery runbook documented

**Business:**
- [ ] Pilot schools signed (min 3)
- [ ] Payment gateway accounts activated (M-Pesa, Paystack, PesaPal)
- [ ] Pricing finalized
- [ ] Terms of Service + Privacy Policy published
- [ ] Customer support process defined
- [ ] Sales playbook documented

**Compliance:**
- [ ] GDPR compliance verified (data export, deletion)
- [ ] Local regulations reviewed (Kenya, Nigeria, South Africa)
- [ ] Data Processing Agreements (DPAs) signed with schools
- [ ] Security certifications obtained (SOC 2, ISO 27001 - optional)

---

## 9. Document Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 20, 2025 | Product Team | Initial PRD based on Sprint 3 completion |

---

## 10. Appendices

### Appendix A: Glossary

- **LMS:** Learning Management System
- **SaaS:** Software as a Service
- **PRD:** Product Requirements Document
- **MVP:** Minimum Viable Product
- **JWT:** JSON Web Token
- **RLS:** Row Level Security
- **GDPR:** General Data Protection Regulation
- **POPIA:** Protection of Personal Information Act (South Africa)
- **ASVS:** Application Security Verification Standard (OWASP)

### Appendix B: References

- [API Development Story Plan](/home/jay/elymica-platform/API-DEVELOPMENT-STORY-PLAN.md)
- [Deployment Success Report](/home/jay/elymica-platform/DEPLOYMENT-SUCCESS-REPORT.md)
- [Strategic Overview](/home/jay/elymica-platform/ELYMICA-STRATEGIC-OVERVIEW.md)
- [Backend Status Report](/home/jay/elymica-platform/BACKEND-STATUS-REPORT.md)

---

**Document Status:** ACTIVE
**Next Review Date:** December 20, 2025
**Owner:** Product Team
**Stakeholders:** Engineering, Sales, Customer Success
