'use client';

import { useMemo, useState } from 'react';
import { toast, Toaster } from 'sonner';
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
  useCourses,
  useClassRoster,
  useParentRecipients,
  useSendMessage,
  useCreateLesson,
  useCreateModule,
  useSubmitGrade,
} from '@elymica/hooks';
import { useApiServices } from '@/components/providers/api-provider';
import { useTeacherClasses } from './use-teacher-classes';
import { RichTextEditor } from '../editor/rich-text-editor';

interface TeacherDashboardContentProps {
  teacherName: string;
  tenantSubdomain: string;
}

export function TeacherDashboardContent({
  teacherName,
  tenantSubdomain,
}: TeacherDashboardContentProps) {
  const {
    assignmentService,
    notificationService,
    lmsService,
    enrollmentService,
    contentService,
    gradingService,
  } = useApiServices();
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [messageForm, setMessageForm] = useState({ recipientId: '', subject: '', message: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    moduleId: '',
    content: '',
  });
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', courseId: '' });
  const [gradingFormErrors, setGradingFormErrors] = useState<Record<string, string>>({});
  const [optimisticGrades, setOptimisticGrades] = useState<Record<string, { score: number; feedback?: string }>>({});

  const {
    mutate: sendMessage,
    isPending: sendingMessage,
    isSuccess: messageSent,
    reset: resetMessageStatus,
  } = useSendMessage(notificationService);
  const { mutateAsync: createLesson, isPending: creatingLesson } = useCreateLesson(contentService);
  const { mutateAsync: createModule, isPending: creatingModule } = useCreateModule(contentService);
  const { mutate: submitGrade, isPending: isSubmittingGrade } = useSubmitGrade(gradingService);

  const activeClassId = selectedClassId ?? classes[0]?.id ?? null;
  const selectedClass = useMemo(
    () => classes.find((cls) => cls.id === activeClassId),
    [classes, activeClassId]
  );

  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments(
    assignmentService,
    activeClassId
      ? {
          status: 'submitted',
          course_id: activeClassId,
        }
      : { status: 'submitted' }
  );

  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications(
    notificationService,
    { status: 'all', limit: 5 }
  );

  const { data: coursesData, isLoading: coursesLoading } = useCourses(lmsService, {
    status: 'active',
  });
  const { data: rosterData, isLoading: rosterLoading } = useClassRoster(
    enrollmentService,
    activeClassId
  );
  const { data: parentRecipientsData, isLoading: parentRecipientsLoading } = useParentRecipients(
    notificationService,
    activeClassId ? { class_id: activeClassId } : undefined
  );

  const gradingQueueCount = assignmentsData?.assignments?.length ?? 0;
  const upcomingSessions = classes.slice(0, 3);
  const notifications = notificationsData?.notifications ?? [];
  const rosterStudents = rosterData?.students ?? [];
  const parentRecipients = parentRecipientsData?.recipients ?? [];

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

  async function handleLessonSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Basic validation
    if (!lessonForm.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }
    if (!lessonForm.content.trim() || lessonForm.content === '<p></p>') {
      toast.error('Lesson content is required');
      return;
    }

    const toastId = toast.loading('Creating lesson...');
    try {
      await createLesson({
        title: lessonForm.title,
        type: lessonForm.type as 'video' | 'text' | 'quiz' | 'interactive',
        content: { body: lessonForm.content },
        module_id: lessonForm.moduleId || undefined,
      });
      toast.success('Lesson created successfully!', { id: toastId });
      setLessonForm({ title: '', type: 'video', moduleId: '', content: '' });
    } catch (error) {
      toast.error(`Failed to create lesson: ${(error as Error).message}`, { id: toastId });
    }
  }

  async function handleModuleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Basic validation
    if (!moduleForm.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    const toastId = toast.loading('Creating module...');
    try {
      await createModule({
        title: moduleForm.title,
        description: moduleForm.description || undefined,
        course_id: moduleForm.courseId || (activeClassId ?? ''),
      });
      toast.success('Module created successfully!', { id: toastId });
      setModuleForm({ title: '', description: '', courseId: '' });
    } catch (error) {
      toast.error(`Failed to create module: ${(error as Error).message}`, { id: toastId });
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-sand text-night">
      <header className="border-b border-sage/20 bg-white/90 px-6 py-6 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-olive">Elymica</p>
            <h1 className="font-heading text-3xl text-night">Teacher Dashboard</h1>
            <p className="text-sm text-olive">
              {teacherName || 'Teacher'} • {tenantSubdomain}
            </p>
          </div>
          <div className="text-sm text-olive">
            <p className="font-medium text-night">Classes under you</p>
            <p>{classes.length} active</p>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-olive">Your teaching schedule</p>
            <h2 className="font-heading text-2xl text-night">Select a class</h2>
          </div>
          <Button size="sm" variant="secondary">
            Create assignment
          </Button>
        </div>

        <div className="mb-8 flex flex-wrap gap-4">
          {classesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 w-60 animate-pulse rounded-2xl bg-white/70" />
            ))
          ) : (
            classes.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`flex w-64 flex-col rounded-2xl border px-4 py-3 text-left transition ${
                  activeClassId === cls.id
                    ? 'border-sage bg-white shadow-lg shadow-sand/40'
                    : 'border-sage/20 bg-white/70 hover:border-sage/60'
                }`}
              >
                <span className="text-xs text-olive">{cls.gradeLevel}</span>
                <span className="font-heading text-lg text-night">{cls.name}</span>
                <span className="text-xs text-olive">
                  {cls.studentCount} students • {cls.assignmentsToGrade} to grade
                </span>
              </button>
            ))
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardDescription>Assignments to grade</CardDescription>
              <CardTitle className="text-3xl">
                {assignmentsLoading ? (
                  <div className="h-9 w-16 animate-pulse rounded bg-sand" />
                ) : (
                  gradingQueueCount
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-olive">
                {selectedClass ? selectedClass.name : 'Focus on submitted work first'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardDescription>Active courses</CardDescription>
              <CardTitle className="text-3xl">
                {coursesLoading ? (
                  <div className="h-9 w-16 animate-pulse rounded bg-sand" />
                ) : (
                  coursesData?.courses?.length ?? 0
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-olive">LMS synced</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardDescription>Unread messages</CardDescription>
              <CardTitle className="text-3xl">
                {notificationsLoading ? (
                  <div className="h-9 w-12 animate-pulse rounded bg-sand" />
                ) : (
                  notificationsData?.unread_count ?? 0
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-olive">Parent & student conversations</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card className="border-none bg-surface shadow-lg shadow-sand/40 lg:col-span-2">
            <CardHeader>
              <CardTitle>Grading Queue</CardTitle>
              <CardDescription>Submitted work awaiting review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignmentsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl border border-sage/15 bg-white/70" />
                ))
              ) : assignmentsData?.assignments?.length ? (
                assignmentsData.assignments.slice(0, 6).map((assignment) => (
                  <div key={assignment.id} className="rounded-xl border border-sage/15 bg-white/80 p-4 space-y-3">
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
                      Submitted {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                    {/* Show optimistic grade if it exists */}
                    {optimisticGrades[assignment.id] ? (
                      <div className="rounded-lg border border-accent-gold/30 bg-accent-gold/10 px-3 py-2">
                        <p className="text-sm font-medium text-night">
                          ✓ Grade Submitted: {optimisticGrades[assignment.id].score}/100
                        </p>
                        {optimisticGrades[assignment.id].feedback && (
                          <p className="text-xs text-olive mt-1">
                            {optimisticGrades[assignment.id].feedback}
                          </p>
                        )}
                        <p className="text-xs text-sage mt-1">Syncing with server...</p>
                      </div>
                    ) : (
                      <form
                        className="grid gap-2 md:grid-cols-3"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const formData = new FormData(event.currentTarget);
                          const scoreRaw = formData.get('score');
                          const comments = String(formData.get('comments') || '');
                          const grade = String(formData.get('grade') || '');

                          // Validation
                          const errors: Record<string, string> = {};
                          if (!scoreRaw || scoreRaw === '') {
                            errors[`score-${assignment.id}`] = 'Score is required';
                          }
                          const score = Number(scoreRaw);
                          if (isNaN(score) || score < 0 || score > 100) {
                            errors[`score-${assignment.id}`] = 'Score must be between 0 and 100';
                          }

                          if (Object.keys(errors).length > 0) {
                            setGradingFormErrors(errors);
                            toast.error('Please fix validation errors');
                            return;
                          }

                          // Clear errors
                          setGradingFormErrors({});

                          // Optimistic update
                          setOptimisticGrades((prev) => ({
                            ...prev,
                            [assignment.id]: {
                              score,
                              feedback: comments || undefined,
                            },
                          }));

                          // Show loading toast
                          const toastId = toast.loading('Submitting grade...');

                          // Submit grade
                          submitGrade(
                            {
                              assignmentId: assignment.id,
                              payload: {
                                score,
                                grade: grade || undefined,
                                teacher_comments: comments || undefined,
                                published: true,
                              },
                            },
                            {
                              onSuccess: () => {
                                toast.success('Grade submitted successfully!', { id: toastId });
                                event.currentTarget.reset();
                                // Remove optimistic state after 2 seconds
                                setTimeout(() => {
                                  setOptimisticGrades((prev) => {
                                    const next = { ...prev };
                                    delete next[assignment.id];
                                    return next;
                                  });
                                }, 2000);
                              },
                              onError: (error) => {
                                toast.error(`Failed to submit grade: ${error.message}`, { id: toastId });
                                // Remove optimistic state on error
                                setOptimisticGrades((prev) => {
                                  const next = { ...prev };
                                  delete next[assignment.id];
                                  return next;
                                });
                              },
                            }
                          );
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          <input
                            name="score"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Score (0-100)"
                            className={`rounded-lg border px-2 py-1 text-sm outline-none focus:ring-2 ${
                              gradingFormErrors[`score-${assignment.id}`]
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                : 'border-sage/30 focus:border-sage focus:ring-sage/20'
                            } bg-white`}
                            disabled={isSubmittingGrade}
                          />
                          {gradingFormErrors[`score-${assignment.id}`] && (
                            <span className="text-xs text-red-600">
                              {gradingFormErrors[`score-${assignment.id}`]}
                            </span>
                          )}
                        </div>
                        <input
                          name="grade"
                          placeholder="Grade (A/B+)"
                          className="rounded-lg border border-sage/30 bg-white px-2 py-1 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                          disabled={isSubmittingGrade}
                        />
                        <input
                          name="comments"
                          placeholder="Feedback (optional)"
                          className="rounded-lg border border-sage/30 bg-white px-2 py-1 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 md:col-span-2"
                          disabled={isSubmittingGrade}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="md:col-span-1"
                          disabled={isSubmittingGrade}
                        >
                          {isSubmittingGrade ? 'Submitting...' : 'Submit Grade'}
                        </Button>
                      </form>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-olive">Nothing to grade right now.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardTitle>Messages & Alerts</CardTitle>
              <CardDescription>Recent parent/student communication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg border border-terracotta/20 bg-terracotta/5" />
                ))
              ) : notifications.length ? (
                notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="rounded-lg border border-terracotta/20 bg-terracotta/5 p-4">
                    <p className="font-medium text-night">{notification.title}</p>
                    <p className="text-sm text-olive">{notification.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-olive">No new messages.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-10 border-none bg-white/90 shadow-lg shadow-sand/30">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Next lessons on your schedule</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {classesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl border border-sage/15 bg-white/70" />
              ))
            ) : upcomingSessions.length ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="rounded-xl border border-sage/15 bg-white/80 p-4">
                  <p className="text-xs text-olive">{session.gradeLevel}</p>
                  <p className="font-heading text-lg text-night">{session.name}</p>
                  <p className="text-sm text-olive">{session.nextSession}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-olive">No upcoming sessions scheduled.</p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-10 border-none bg-white/90 shadow-lg shadow-sand/30">
          <CardHeader>
            <CardTitle>Class Roster</CardTitle>
            <CardDescription>Students enrolled in this class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rosterLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg border border-sage/15 bg-white/70" />
              ))
            ) : rosterStudents.length ? (
              rosterStudents.slice(0, 6).map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-lg border border-sage/15 bg-white/80 px-4 py-3">
                  <div>
                    <p className="font-medium text-night">
                      {student.first_name} {student.last_name ?? ''}
                    </p>
                    <p className="text-xs text-olive">{student.status ?? 'active'}</p>
                  </div>
                  <p className="text-xs text-olive">{student.guardian_name ?? 'Guardian TBD'}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-olive">No students found for this class.</p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-10 border-none bg-white/90 shadow-lg shadow-sand/30">
          <CardHeader>
            <CardTitle>Message a Parent</CardTitle>
            <CardDescription>Send updates to guardians about progress</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleMessageSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night" htmlFor="recipientId">
                    Parent
                  </label>
                  {parentRecipientsLoading ? (
                    <div className="h-10 w-full animate-pulse rounded-lg border border-sage/20 bg-white/70" />
                  ) : parentRecipients.length ? (
                    <select
                      id="recipientId"
                      value={messageForm.recipientId}
                      onChange={(event) => handleMessageChange('recipientId', event.target.value)}
                      className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                    >
                      <option value="">Select parent</option>
                      {parentRecipients.map((recipient) => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="recipientId"
                      value={messageForm.recipientId}
                      onChange={(event) => handleMessageChange('recipientId', event.target.value)}
                      placeholder="guardian-user-id"
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
                    placeholder="Progress update"
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
                  placeholder="Share your update..."
                  className="min-h-[120px] w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                  required
                />
              </div>
              {messageSent ? <p className="text-sm text-sage">Message sent.</p> : null}
              <Button type="submit" disabled={sendingMessage}>
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardTitle>Create Module</CardTitle>
              <CardDescription>Structure your curriculum before adding lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleModuleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night" htmlFor="moduleTitle">
                    Module title
                  </label>
                  <input
                    id="moduleTitle"
                    value={moduleForm.title}
                    onChange={(event) =>
                      setModuleForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night" htmlFor="moduleDescription">
                    Description
                  </label>
                  <textarea
                    id="moduleDescription"
                    value={moduleForm.description}
                    onChange={(event) =>
                      setModuleForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night" htmlFor="moduleCourse">
                    Course ID
                  </label>
                  <input
                    id="moduleCourse"
                    value={moduleForm.courseId}
                    onChange={(event) =>
                      setModuleForm((prev) => ({ ...prev, courseId: event.target.value }))
                    }
                    placeholder={activeClassId ?? 'course-id'}
                    className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                  />
                </div>
                <Button type="submit" disabled={creatingModule}>
                  {creatingModule ? 'Creating...' : 'Create Module'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none bg-white/90 shadow-lg shadow-sand/30">
            <CardHeader>
              <CardTitle>Create Lesson</CardTitle>
              <CardDescription>Draft a quick lesson for any module</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleLessonSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night" htmlFor="lessonTitle">
                    Lesson title
                  </label>
                  <input
                    id="lessonTitle"
                    value={lessonForm.title}
                    onChange={(event) =>
                      setLessonForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night" htmlFor="lessonType">
                    Lesson type
                  </label>
                  <select
                    id="lessonType"
                    value={lessonForm.type}
                    onChange={(event) =>
                      setLessonForm((prev) => ({ ...prev, type: event.target.value }))
                    }
                    className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                  >
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                    <option value="quiz">Quiz</option>
                    <option value="interactive">Interactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night" htmlFor="moduleId">
                    Module ID
                  </label>
                  <input
                    id="moduleId"
                    value={lessonForm.moduleId}
                    onChange={(event) =>
                      setLessonForm((prev) => ({ ...prev, moduleId: event.target.value }))
                    }
                    placeholder="module-id"
                    className="w-full rounded-lg border border-sage/30 bg-white px-4 py-2 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-night">
                    Content
                  </label>
                  <RichTextEditor
                    content={lessonForm.content}
                    onChange={(content) =>
                      setLessonForm((prev) => ({ ...prev, content }))
                    }
                    placeholder="Write your lesson content with rich formatting..."
                    disabled={creatingLesson}
                  />
                  <p className="text-xs text-olive">
                    Use the toolbar to format text, add lists, code blocks, and links
                  </p>
                </div>
                <Button type="submit" disabled={creatingLesson}>
                  {creatingLesson ? 'Saving...' : 'Create Lesson'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      <Toaster position="bottom-right" richColors closeButton />
    </main>
  );
}
