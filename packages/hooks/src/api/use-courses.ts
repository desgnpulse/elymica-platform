import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LMSService } from '@elymica/api-client';

/**
 * Query keys for LMS data
 */
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  progress: (id: string) => [...courseKeys.all, 'progress', id] as const,
};

/**
 * Hook to fetch list of courses
 */
export function useCourses(
  lmsService: LMSService,
  params?: {
    status?: 'active' | 'archived';
    enrolled?: boolean;
    page?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => lmsService.listCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch course details with syllabus
 */
export function useCourseDetails(lmsService: LMSService, courseId: string) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => lmsService.getCourseDetails(courseId),
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch course progress
 */
export function useCourseProgress(lmsService: LMSService, courseId: string) {
  return useQuery({
    queryKey: courseKeys.progress(courseId),
    queryFn: () => lmsService.getCourseProgress(courseId),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to enroll in a course
 */
export function useEnrollInCourse(lmsService: LMSService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => lmsService.enrollInCourse(courseId),
    onSuccess: () => {
      // Invalidate course lists to refetch with new enrollment status
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to mark lesson as complete
 */
export function useMarkLessonComplete(lmsService: LMSService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lessonId,
      timeSpent,
      quizScore,
    }: {
      lessonId: string;
      timeSpent: number;
      quizScore?: number;
    }) => lmsService.markLessonComplete(lessonId, timeSpent, quizScore),
    onSuccess: (_, variables) => {
      // Invalidate progress queries
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
