'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@elymica/ui';
import {
  useCourses,
  useAssignments,
  useNotifications,
  useStudentGrades,
} from '@elymica/hooks';
import { useApiServices } from '@/components/providers/api-provider';

interface DashboardContentProps {
  studentId: string;
  studentName: string;
  tenantSubdomain: string;
}

export function DashboardContent({
  studentId,
  studentName,
  tenantSubdomain,
}: DashboardContentProps) {
  // Get API services from context
  const { lmsService, assignmentService, notificationService, gradingService } =
    useApiServices();

  // Fetch data using hooks
  const { data: coursesData, isLoading: coursesLoading } = useCourses(lmsService, {
    enrolled: true,
    status: 'active',
  });

  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments(
    assignmentService,
    { status: 'pending' }
  );

  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(
    notificationService,
    { status: 'unread', limit: 5 }
  );

  const { data: gradesData, isLoading: gradesLoading } = useStudentGrades(
    gradingService,
    studentId
  );

  // Calculate overall progress
  const overallProgress = coursesData?.courses?.length
    ? Math.round(
        coursesData.courses.reduce(
          (acc, course) => acc + (course.progress_percentage || 0),
          0
        ) / coursesData.courses.length
      )
    : 0;

  // Count pending assignments
  const pendingCount = assignmentsData?.assignments?.length || 0;

  // Safe grade formatting
  const averagePercentage = gradesData?.summary?.average_percentage;
  const overallGPA = gradesData?.summary?.overall_gpa;
  const formattedPercentage =
    typeof averagePercentage === 'number' ? averagePercentage.toFixed(1) : '0.0';
  const formattedGPA = typeof overallGPA === 'number' ? overallGPA.toFixed(2) : '0.00';

  return (
    <main className="flex min-h-screen flex-col bg-sand text-night">
      <header className="border-b border-sage/20 bg-white/90 px-6 py-6 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-olive">Elymica</p>
            <h1 className="font-heading text-3xl text-night">Student Dashboard</h1>
            <p className="text-sm text-olive">
              {studentName} • {tenantSubdomain}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-olive">
            <div>
              <p className="font-medium text-night">Academic Year</p>
              <p>2025 • Term 1</p>
            </div>
            <div>
              <p className="font-medium text-night">Notifications</p>
              <p className="text-terracotta">{notificationsData?.unread_count || 0} unread</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardDescription>Overall Progress</CardDescription>
              <CardTitle className="text-3xl">
                {coursesLoading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-sand" />
                ) : (
                  `${overallProgress}%`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-olive">
                {coursesData?.courses?.length || 0} active courses
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardDescription>Assignments Due</CardDescription>
              <CardTitle className="text-3xl">
                {assignmentsLoading ? (
                  <div className="h-9 w-12 animate-pulse rounded bg-sand" />
                ) : (
                  pendingCount
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-olive">Complete before deadline</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardDescription>Overall Grade</CardDescription>
              <CardTitle className="text-3xl">
                {gradesLoading ? (
                  <div className="h-9 w-16 animate-pulse rounded bg-sand" />
                ) : (
                  `${formattedPercentage}%`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-olive">GPA: {formattedGPA}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Assignments */}
          <Card className="border-none bg-surface shadow-lg shadow-sand/40 lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Synced from Assignment Service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignmentsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl border border-sage/15 bg-white/70"
                  />
                ))
              ) : assignmentsData?.assignments?.length ? (
                assignmentsData.assignments.slice(0, 5).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="rounded-xl border border-sage/15 bg-white/70 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-night">{assignment.title}</p>
                        <p className="text-sm text-olive">{assignment.course_title}</p>
                      </div>
                      <span className="text-xs uppercase tracking-wider text-sage">
                        {assignment.submission_status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-olive">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-olive">No pending assignments</p>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Real-time via Notification Service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-lg border border-terracotta/20 bg-terracotta/5"
                  />
                ))
              ) : notificationsData?.notifications?.length ? (
                notificationsData.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-lg border border-terracotta/20 bg-terracotta/5 p-4"
                  >
                    <p className="font-medium text-night">{notification.title}</p>
                    <p className="text-sm text-olive">{notification.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-olive">No new notifications</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
