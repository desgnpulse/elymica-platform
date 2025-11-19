# Elymica Platform - Frontend Monorepo

Multi-tenant educational platform serving K-12, tertiary, and publisher marketplace needs across Africa.

**Sprint 3 Status**: ✅ Week 3 Complete - Production ready! UX polished, WCAG AA compliant, performance optimized 🎉

**🚀 Ready to Deploy**: [Start Here](DEPLOYMENT-READY.md) | [Quick Start](QUICK-START-DEPLOYMENT.md) | [Full Checklist](DEPLOYMENT-CHECKLIST.md)

## Architecture

This monorepo contains:

- **apps/** - Customer-facing applications
  - `landing` ✅ - Main marketing site (elymica.com)
  - `student-portal` ✅ - Student learning portal (live data)
  - `parent-portal` ✅ - Parent monitoring portal (multi-child support)
  - `teacher-portal` ✅ - Teacher management portal (grading queue)

- **packages/** - Shared libraries
  - `tokens` ✅ - Sahara-Japandi design tokens
  - `ui` ✅ - React component library (Button, Card)
  - `api-client` ✅ - Typed SDK (8 services, 30 endpoints, 43 Zod schemas)
  - `hooks` ✅ - TanStack Query hooks (21 hooks)
  - `config` ✅ - Shared TypeScript/ESLint configs

- **tooling/** - Development tools
  - `mock-server` - MSW handlers for development

## Tech Stack

- **Framework**: Next.js 14 (App Router) + React 19 + TypeScript 5.3
- **Styling**: Tailwind CSS 4 + Sahara-Japandi design system
- **Components**: Radix UI (accessible primitives)
- **State**: TanStack Query 5 (data fetching) + Zustand (local UI state)
- **Auth**: NextAuth 4 (multi-tenant JWT with session-aware API provider)
- **Validation**: Zod (schema validation for all API responses)
- **HTTP**: Axios (with automatic token injection)
- **Monorepo**: pnpm workspaces + Turbo

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Build all packages and apps
pnpm build

# Run tests
pnpm test

# Lint all code
pnpm lint
```

### Development

Each app can be run independently:

```bash
# Run specific app
cd apps/student-portal
pnpm dev
```

## Design System

Sahara-Japandi theme combines African landscape colors with Japanese minimalism:

- **Sand Soft** (#F4EDE4) - Primary background
- **Terracotta** (#D2967B) - Secondary actions
- **Olive Sage** (#A5A58D) - Muted elements
- **Deep Sage** (#6B705C) - Primary actions
- **Night Soil** (#2F2D2A) - Text
- **Accent Gold** (#C2A878) - Highlights

Typography: Playfair Display (headings) + Inter (body)

## API Integration

Backend services run on microservices architecture:

- Auth Service: Port 8007
- LMS Service: Port 8027
- Content Service: Port 8026 ✅ Integrated (createModule, createLesson)
- Assignment Service: Port 8017
- Grading Service: Port 8018 ✅ Integrated (read + write mutations)
- Enrollment Service: Port 8022 ✅ Integrated (parent children, class roster)
- Analytics Service: Port 8024 ✅ Integrated (student attendance)
- Notification Service: Port 8023 ✅ Integrated (bidirectional messaging)

See [API-CONTRACT-DOCUMENTATION.md](/home/jay/Downloads/API-CONTRACT-DOCUMENTATION.md) for complete API specs.

## Documentation

### Architecture Documents
- [Gap Analysis](/home/jay/Downloads/ELYMICA-GAP-ANALYSIS.md) - Vision vs current state
- [API Contracts](/home/jay/Downloads/API-CONTRACT-DOCUMENTATION.md) - Complete API specs
- [Frontend Architecture](/home/jay/Downloads/FRONTEND-ARCHITECTURE.md) - Tech stack decisions
- [Sprint 3 Roadmap](/home/jay/Downloads/SPRINT-3-ROADMAP.md) - Week-by-week plan

### Sprint Reports
- [Day 1 Complete](SPRINT-3-DAY-1-COMPLETE.md) - Workspace setup
- [Day 2 In Progress](SPRINT-3-DAY-2-INPROGRESS.md) - Auth integration
- [Day 3 Complete](SPRINT-3-DAY-3-COMPLETE.md) - API integration
- [Day 3 Fixes](SPRINT-3-DAY-3-FIXES.md) - Critical fixes applied
- [Day 3 Final](SPRINT-3-DAY-3-FINAL.md) - Production-ready status
- [Day 4 Complete](SPRINT-3-DAY-4-COMPLETE.md) - Parent portal scaffolded
- [Day 5 Complete](SPRINT-3-DAY-5-COMPLETE.md) - Teacher portal scaffolded
- [Week 1 Summary](SPRINT-3-WEEK-1-SUMMARY.md) - Week 1 complete summary
- [Parent Integration](PARENT-PORTAL-INTEGRATION-COMPLETE.md) - Enrollment + Analytics integration
- [Week 2 Integration](WEEK-2-INTEGRATION-COMPLETE.md) - Bidirectional messaging complete
- [Week 2 Final](WEEK-2-FINAL-COMPLETE.md) - Grading + Content workflows
- [Week 3 Days 11-12](WEEK-3-DAYS-11-12-COMPLETE.md) - UX polish (grading + TipTap)
- [Week 3 Day 13](WEEK-3-DAY-13-ACCESSIBILITY-AUDIT.md) - Accessibility audit + fixes
- [Week 3 Day 14](WEEK-3-DAY-14-PERFORMANCE-AUDIT.md) - Performance optimization
- [Week 3 Day 15](WEEK-3-DAY-15-PRODUCTION-READINESS.md) - Production readiness ✨ NEW
- [Sprint Status](SPRINT-3-STATUS.md) - Overall progress tracking

### Developer Guides
- [Portal Build Pattern](docs/PORTAL-BUILD-PATTERN.md) - Reusable template for building new portals

### Deployment Guides
- [Deployment Checklist](DEPLOYMENT-CHECKLIST.md) - Complete deployment workflow ⭐ START HERE
- [Deployment Options](docs/DEPLOYMENT-OPTIONS.md) - Platform comparison (Cloudflare, Vercel, AWS, etc.)
- [Cloudflare Pilot](docs/CLOUDFLARE-PILOT-DEPLOYMENT.md) - Pilot deployment guide (student portal first)
- [Cloudflare Full Setup](docs/CLOUDFLARE-DEPLOYMENT.md) - Complete Cloudflare Pages setup
- [Quick Comparison](docs/DEPLOYMENT-QUICK-COMPARISON.md) - TL;DR platform comparison

## License

Proprietary - Elymica Platform
