'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@elymica/ui';
import {
  useAssignments,
  useNotifications,
  useStudentGrades,
  useParentChildren,
  useStudentAttendance,
  useSendMessage,
  useTeacherRecipients,
} from '@elymica/hooks';
import { useApiServices } from '@/components/providers/api-provider';

interface ParentDashboardContentProps {
  parentName: string;
  tenantSubdomain: string;
  parentId: string;
}

export function ParentDashboardContent({
  parentName,
  tenantSubdomain,
  parentId,
}: ParentDashboardContentProps) {
  const {
    assignmentService,
    notificationService,
    gradingService,
    enrollmentService,
    analyticsService,
  } = useApiServices();
  const { data: childrenResponse, isLoading: childrenLoading } = useParentChildren(
    enrollmentService,
    parentId
  );
  const children = useMemo(
    () =>
      childrenResponse?.children.map((child) => ({
        id: child.id,
        name: child.last_name ? `${child.first_name} ${child.last_name}` : child.first_name,
        gradeLevel: child.grade_level,
        attendancePercent: child.attendance_percentage ?? 0,
      })) ?? [],
    [childrenResponse]
  );
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [messageForm, setMessageForm] = useState({ recipientId: '', subject: '', message: '' });
  const {
    mutate: sendMessage,
    isPending: sendingMessage,
    isSuccess: messageSent,
    reset: resetMessageStatus,
  } = useSendMessage(notificationService);
  const activeChildId = selectedChildId ?? children[0]?.id ?? null;

  const { data: teacherRecipientsData, isLoading: recipientsLoading } = useTeacherRecipients(
    notificationService,
    activeChildId ? { student_id: activeChildId } : undefined
  );
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments(
    assignmentService,
    activeChildId
      ? {
          status: 'pending',
          student_id: activeChildId,
        }
      : undefined
  );
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(
    notificationService,
    activeChildId
      ? {
          status: 'all',
          limit: 5,
          student_id: activeChildId,
        }
      : { status: 'all', limit: 5 }
  );
  const { data: gradesData, isLoading: gradesLoading } = useStudentGrades(
    gradingService,
    activeChildId ?? ''
  );
  const { data: attendanceData, isLoading: attendanceLoading } = useStudentAttendance(
    analyticsService,
    activeChildId ?? null
  );

  const formattedPercentage =
    typeof gradesData?.summary?.average_percentage === 'number'
      ? gradesData.summary.average_percentage.toFixed(1)
      : '0.0';
  const formattedGPA =
    typeof gradesData?.summary?.overall_gpa === 'number'
      ? gradesData.summary.overall_gpa.toFixed(2)
      : '0.00';

  const pendingAssignments = assignmentsData?.assignments?.length ?? 0;
  const unreadMessages = notificationsData?.unread_count ?? 0;
  const attendanceSummary = attendanceData?.attendance.summary;
  const attendanceRecords = attendanceData?.attendance.records ?? [];
  const recentAttendance = attendanceRecords.slice(-7);
  const teacherRecipients = teacherRecipientsData?.recipients ?? [];

  const firstTeacherId = teacherRecipients[0]?.id;

  useEffect(() => {
    if (!messageForm.recipientId && firstTeacherId) {
      setMessageForm((prev) => ({ ...prev, recipientId: firstTeacherId }));
    }
  }, [firstTeacherId, messageForm.recipientId]);

  function handleMessageChange(field: 'recipientId' | 'subject' | 'message', value: string) {
    setMessageForm((prev) => ({ ...prev, [field]: value }));
    if (messageSent) {
      resetMessageStatus();
    }
  }

  function handleMessageSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage({
      recipient_id: messageForm.recipientId,
      subject: messageForm.subject,
      message: messageForm.message,
    });
    setMessageForm((prev) => ({ ...prev, message: '' }));
  }

  return (
    <main className="flex min-h-screen flex-col bg-sand text-night">
      <header className="border-b border-sage/20 bg-white/90 px-6 py-6 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-olive">Elymica</p>
            <h1 className="font-heading text-3xl text-night">Parent Dashboard</h1>
            <p className="text-sm text-olive">
              {parentName || 'Parent'} • {tenantSubdomain}
            </p>
          </div>
          <div className="text-sm text-olive">
            <p className="font-medium text-night">Notifications</p>
            <p className="text-terracotta">{unreadMessages} unread</p>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-olive">Children linked to your profile</p>
            <h2 className="font-heading text-2xl text-night">Choose a child to view details</h2>
          </div>
          <Button variant="secondary" size="sm">
            Invite another guardian
          </Button>
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          {childrenLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 w-48 animate-pulse rounded-2xl bg-white/70" />
            ))
          ) : (
            children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChildId(child.id)}
                className={`flex w-56 flex-col rounded-2xl border px-4 py-3 text-left transition ${
                  activeChildId === child.id
                    ? 'border-sage bg-white shadow-lg shadow-sand/40'
                    : 'border-sage/20 bg-white/70 hover:border-sage/60'
                }`}
              >
                <span className="text-xs text-olive">{child.gradeLevel}</span>
                <span className="font-heading text-lg text-night">{child.name}</span>
                <span className="text-xs text-olive">Attendance {child.attendancePercent}%</span>
              </button>
            ))
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardDescription>Average Grade</CardDescription>
              <CardTitle className="text-3xl">
                {gradesLoading ? (
                  <div className="h-9 w-16 animate-pulse rounded bg-sand" />
                ) : (
                  `${formattedPercentage}%`
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-olive">GPA {formattedGPA}</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardDescription>Attendance</CardDescription>
              <CardTitle className="text-3xl">
                {attendanceLoading ? (
                  <div className="h-9 w-16 animate-pulse rounded bg-sand" />
                ) : attendanceSummary ? (
                  `${attendanceSummary.attendance_percentage.toFixed(1)}%`
                ) : (
                  '—'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-olive">
                {attendanceSummary
                  ? `${attendanceSummary.present}/${attendanceSummary.total_days} days present`
                  : 'Past 7 days shown below'}
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
                  pendingAssignments
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-olive">Encourage timely submissions</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card className="border-none bg-surface shadow-lg shadow-sand/40 lg:col-span-2">
            <CardHeader>
              <CardTitle>Assignments Overview</CardTitle>
              <CardDescription>Upcoming work for the selected child</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignmentsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl border border-sage/15 bg-white/70" />
                ))
              ) : assignmentsData?.assignments?.length ? (
                assignmentsData.assignments.slice(0, 5).map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border border-sage/15 bg-white/80 p-4">
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
                      Due {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-olive">No pending assignments.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardTitle>Messages & Alerts</CardTitle>
              <CardDescription>Teacher communication via Notification Service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg border border-terracotta/20 bg-terracotta/5" />
                ))
              ) : notificationsData?.notifications?.length ? (
                notificationsData.notifications.map((notification) => (
                  <div key={notification.id} className="rounded-lg border border-terracotta/20 bg-terracotta/5 p-4">
                    <p className="font-medium text-night">{notification.title}</p>
                    <p className="text-sm text-olive">{notification.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-olive">No messages available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
          <CardHeader>
            <CardTitle>Attendance Timeline</CardTitle>
            <CardDescription>Snapshot of this week&apos;s attendance</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            {attendanceLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 flex-1 animate-pulse rounded-xl border border-sage/15 bg-white/60" />
              ))
            ) : recentAttendance.length ? (
              recentAttendance.map((record) => (
                <div
                  key={record.date}
                  className={`flex-1 rounded-xl border px-4 py-6 text-center ${
                    record.status === 'present'
                      ? 'border-sage bg-sage/10 text-sage'
                      : record.status === 'late'
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-terracotta bg-terracotta/10 text-terracotta'
                  }`}
                >
                  <p className="text-sm">
                    {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </p>
                  <p className="text-lg font-semibold capitalize">{record.status}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-olive">Select a child to view attendance insights.</p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-10 border-none bg-white/90 shadow-lg shadow-sand/30">
          <CardHeader>
            <CardTitle>Message a Teacher</CardTitle>
            <CardDescription>Send a direct note to your child&apos;s teacher</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleMessageSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night" htmlFor="recipientId">
                    Teacher
                  </label>
                  {recipientsLoading ? (
                    <div className="h-10 w-full animate-pulse rounded-lg border border-sage/20 bg-white/70" />
                  ) : teacherRecipients.length ? (
                    <select
                      id="recipientId"
                      value={messageForm.recipientId}
                      onChange={(event) => handleMessageChange('recipientId', event.target.value)}
                      className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                    >
                      {teacherRecipients.map((recipient) => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name}
                          {recipient.subject_area ? ` • ${recipient.subject_area}` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="recipientId"
                      value={messageForm.recipientId}
                      onChange={(event) => handleMessageChange('recipientId', event.target.value)}
                      placeholder="teacher-user-id"
                      className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                      required
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    id="subject"
                    value={messageForm.subject}
                    onChange={(event) => handleMessageChange('subject', event.target.value)}
                    placeholder="Homework question"
                    className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-night" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  value={messageForm.message}
                  onChange={(event) => handleMessageChange('message', event.target.value)}
                  placeholder="Share your update or question..."
                  className="min-h-[120px] w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                  required
                />
              </div>
              {messageSent ? <p className="text-sm text-sage">Message sent successfully.</p> : null}
              <Button type="submit" disabled={sendingMessage}>
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
