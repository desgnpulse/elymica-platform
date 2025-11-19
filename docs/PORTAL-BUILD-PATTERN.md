# Portal Build Pattern - Reusable Template

**Purpose**: Step-by-step guide for building parent/teacher portals using the proven student portal pattern.

---

## 🏗️ Architecture Pattern (Proven in Student Portal)

```
SessionProvider
  └─ ApiProvider (session-aware services)
      └─ QueryClientProvider (TanStack Query cache)
          └─ Page Components (consume useApiServices hook)
```

**Key Benefits**:
- ✅ Automatic token injection (Authorization + X-Tenant-ID)
- ✅ Type-safe API responses (Zod validation)
- ✅ Intelligent caching with TanStack Query
- ✅ Real-time polling for notifications
- ✅ Null-safe rendering (no crashes on missing data)

---

## 📋 Step-by-Step Build Guide

### Step 1: Create Next.js App (5 minutes)

```bash
# From elymica-platform root
cd apps
pnpm create next-app@latest parent-portal --typescript --tailwind --app --no-src-dir

# Answer prompts:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - App Router: Yes
# - Import alias: @/*
```

### Step 2: Install Dependencies (2 minutes)

```bash
cd parent-portal

# Add to package.json dependencies:
{
  "@elymica/api-client": "workspace:^",
  "@elymica/hooks": "workspace:^",
  "@elymica/tokens": "workspace:^",
  "@elymica/ui": "workspace:^",
  "@tanstack/react-query": "^5.90.10",
  "next-auth": "^4.24.13",
  "zustand": "^5.0.8"
}

pnpm install
```

### Step 3: Copy Shared Config (3 minutes)

**Copy from student-portal**:
1. `tsconfig.json` → Extend base config
2. `next.config.ts` → Transpile shared packages
3. `tailwind.config.ts` → Use @elymica/tokens preset
4. `.env.example` → API base URLs

```bash
# Quick copy from student-portal
cp ../student-portal/tsconfig.json .
cp ../student-portal/next.config.ts .
cp ../student-portal/tailwind.config.ts .
cp ../student-portal/.env.example .
```

### Step 4: Set Up Authentication (10 minutes)

**1. Copy NextAuth configuration**:
```bash
mkdir -p src/lib src/types
cp ../student-portal/src/lib/auth-options.ts src/lib/
cp ../student-portal/src/types/next-auth.d.ts src/types/
```

**2. Create API route**:
```bash
mkdir -p src/app/api/auth/[...nextauth]
```

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**3. Create login page**:
```bash
cp -r ../student-portal/src/components/auth src/components/
cp ../student-portal/src/app/login/page.tsx src/app/login/
```

### Step 5: Set Up Providers (5 minutes)

```bash
mkdir -p src/components/providers
cp ../student-portal/src/components/providers/api-provider.tsx src/components/providers/
cp ../student-portal/src/components/providers/app-providers.tsx src/components/providers/
```

**Update root layout**:
```typescript
// src/app/layout.tsx
import { AppProviders } from '@/components/providers/app-providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

### Step 6: Create Portal-Specific Dashboard (30 minutes)

**Parent Portal Example**:
```typescript
// src/components/dashboard/parent-dashboard.tsx
'use client';

import { useApiServices } from '@/components/providers/api-provider';
import {
  useCourses,
  useAssignments,
  useNotifications,
  useStudentGrades,
} from '@elymica/hooks';

export function ParentDashboard({ parentId }: { parentId: string }) {
  const { lmsService, assignmentService, notificationService, gradingService } =
    useApiServices();

  // Fetch parent's children first
  const { data: childrenData, isLoading: childrenLoading } = useParentChildren(
    enrollmentService,
    parentId
  );

  // Select active child (default to first)
  const [selectedChildId, setSelectedChildId] = useState(
    childrenData?.children?.[0]?.id
  );

  // Fetch selected child's data
  const { data: gradesData } = useStudentGrades(gradingService, selectedChildId);
  const { data: assignmentsData } = useAssignments(assignmentService, {
    student_id: selectedChildId,
  });

  return (
    <div>
      {/* Child switcher pills */}
      <div className="flex gap-2">
        {childrenData?.children?.map((child) => (
          <button
            key={child.id}
            onClick={() => setSelectedChildId(child.id)}
            className={selectedChildId === child.id ? 'active' : ''}
          >
            {child.first_name}
          </button>
        ))}
      </div>

      {/* KPI cards, timeline, messaging */}
      {/* ... rest of dashboard */}
    </div>
  );
}
```

### Step 7: Create Portal-Specific Hooks (15 minutes)

**Example: Parent children hook**:
```typescript
// In packages/hooks/src/api/use-enrollment.ts
import { useQuery } from '@tanstack/react-query';
import { EnrollmentService } from '@elymica/api-client';

export const enrollmentKeys = {
  all: ['enrollment'] as const,
  children: (parentId: string) => [...enrollmentKeys.all, 'children', parentId] as const,
};

export function useParentChildren(
  enrollmentService: EnrollmentService,
  parentId: string
) {
  return useQuery({
    queryKey: enrollmentKeys.children(parentId),
    queryFn: () => enrollmentService.getParentChildren(parentId),
    enabled: !!parentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### Step 8: Add Portal-Specific Service (10 minutes)

**Example: Enrollment Service**:
```typescript
// packages/api-client/src/services/enrollment.ts
export class EnrollmentService {
  constructor(private client: AxiosInstance) {}

  async getParentChildren(parentId: string): Promise<GetParentChildrenResponse> {
    const { data } = await this.client.get(`/api/enrollment/parents/${parentId}/children`);
    return GetParentChildrenResponseSchema.parse(data);
  }

  async linkStudent(request: LinkStudentRequest): Promise<void> {
    await this.client.post('/api/enrollment/parents/link-student', request);
  }
}
```

**Export from api-client**:
```typescript
// packages/api-client/src/index.ts
export { EnrollmentService } from './services/enrollment';
export * from './types/enrollment';
```

**Add to ApiProvider**:
```typescript
// components/providers/api-provider.tsx
import { EnrollmentService } from '@elymica/api-client';

// In services object:
return {
  // ... existing services
  enrollmentService: new EnrollmentService(apiClient),
};
```

### Step 9: Style with Sahara-Japandi Theme (ongoing)

**Use design tokens**:
```typescript
// Tailwind classes already configured
<div className="bg-sand text-night">
  <Card className="bg-white/90 shadow-lg shadow-sand/30">
    <Button variant="default">Primary</Button> {/* Deep Sage */}
    <Button variant="secondary">Secondary</Button> {/* Terracotta */}
  </Card>
</div>
```

### Step 10: Test & Verify (10 minutes)

**Checklist**:
```bash
# 1. Lint passes
pnpm --filter parent-portal lint

# 2. Dev server runs
pnpm --filter parent-portal dev

# 3. Login works
# - Visit http://localhost:3000/login
# - Enter credentials
# - Redirects to dashboard

# 4. Check Network tab
# - API requests have Authorization header
# - API requests have X-Tenant-ID header
# - 200 responses from backend

# 5. Check loading states
# - Skeleton loaders show during fetch
# - Empty states when no data
# - No crashes on undefined data
```

---

## 🔧 Portal-Specific Customizations

### Parent Portal

**Unique Features**:
- Child switcher (multi-child support)
- Attendance heatmap/calendar
- Messaging hub with teachers
- Timeline of events (assignments, announcements)

**New Hooks Needed**:
```typescript
useParentChildren(enrollmentService, parentId)
useStudentAttendance(analyticsService, studentId)
useParentMessages(notificationService, parentId)
useTimelineEvents(analyticsService, studentId)
```

**New Services Needed**:
- EnrollmentService (get children, link student)
- Enhanced NotificationService (parent-teacher messaging)

### Teacher Portal

**Unique Features**:
- Class roster management
- Grading queue (kanban-style)
- Content builder (module tree + editor)
- Student performance analytics

**New Hooks Needed**:
```typescript
useTeacherClasses(lmsService, teacherId)
useGradingQueue(assignmentService, teacherId)
useClassRoster(enrollmentService, classId)
useStudentPerformance(analyticsService, classId)
```

**New Services Needed**:
- Enhanced LMSService (teacher class management)
- ContentService (module/lesson creation)

---

## 📊 Time Estimates

| Task | Time | Cumulative |
|------|------|------------|
| Create Next.js app | 5 min | 5 min |
| Install dependencies | 2 min | 7 min |
| Copy shared config | 3 min | 10 min |
| Set up auth | 10 min | 20 min |
| Set up providers | 5 min | 25 min |
| Create dashboard | 30 min | 55 min |
| Create hooks | 15 min | 70 min |
| Add services | 10 min | 80 min |
| Style components | 20 min | 100 min |
| Test & verify | 10 min | 110 min |

**Total**: ~2 hours per portal (with pattern established)

---

## ✅ Quality Checklist

Before marking portal complete:

### Functionality
- [ ] Login flow works
- [ ] Dashboard loads data
- [ ] Loading states show skeletons
- [ ] Empty states display gracefully
- [ ] Real-time updates work (polling)

### Code Quality
- [ ] ESLint passes (`pnpm lint`)
- [ ] TypeScript compiles (`pnpm build`)
- [ ] No `any` types in critical paths
- [ ] All API responses validated with Zod

### Performance
- [ ] Initial load < 2s
- [ ] API responses cached (React Query)
- [ ] Images optimized (next/image)
- [ ] Bundle size < 45kb gzip

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible

### Security
- [ ] Authorization header on all requests
- [ ] X-Tenant-ID prevents cross-tenant leaks
- [ ] No tokens in localStorage (use session)
- [ ] CSRF protection via NextAuth

---

## 🚀 Quick Start Commands

```bash
# Create new portal (replace NAME)
cd elymica-platform/apps
pnpm create next-app@latest NAME-portal --typescript --tailwind --app

# Copy boilerplate from student-portal
cd NAME-portal
cp -r ../student-portal/src/lib src/
cp -r ../student-portal/src/types src/
cp -r ../student-portal/src/components/providers src/components/
cp ../student-portal/tsconfig.json .
cp ../student-portal/next.config.ts .
cp ../student-portal/tailwind.config.ts .

# Install dependencies
pnpm install

# Add to package.json:
# "@elymica/api-client": "workspace:^",
# "@elymica/hooks": "workspace:^",
# "@elymica/tokens": "workspace:^",
# "@elymica/ui": "workspace:^",
# "@tanstack/react-query": "^5.90.10",
# "next-auth": "^4.24.13"

# Run dev server
pnpm dev
```

---

## 📚 Reference Files

**Student Portal** (proven pattern):
- [auth-options.ts](../apps/student-portal/src/lib/auth-options.ts)
- [api-provider.tsx](../apps/student-portal/src/components/providers/api-provider.tsx)
- [dashboard-content.tsx](../apps/student-portal/src/components/dashboard/dashboard-content.tsx)

**Shared Packages**:
- [@elymica/hooks](../packages/hooks/src/api)
- [@elymica/api-client](../packages/api-client/src/services)
- [@elymica/ui](../packages/ui/src/components)

**Documentation**:
- [API Contract Docs](/home/jay/Downloads/API-CONTRACT-DOCUMENTATION.md)
- [Frontend Architecture](/home/jay/Downloads/FRONTEND-ARCHITECTURE.md)
- [Sprint 3 Roadmap](/home/jay/Downloads/SPRINT-3-ROADMAP.md)

---

**Pattern Status**: ✅ Proven in student portal, ready to replicate for parent/teacher portals
