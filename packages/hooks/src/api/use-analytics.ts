import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@elymica/api-client';

export const analyticsKeys = {
  all: ['analytics'] as const,
  attendance: (studentId: string | null, params?: Record<string, unknown>) =>
    [...analyticsKeys.all, 'attendance', studentId, params] as const,
};

export function useStudentAttendance(
  analyticsService: AnalyticsService,
  studentId?: string | null,
  params?: { from_date?: string; to_date?: string }
) {
  return useQuery({
    queryKey: analyticsKeys.attendance(studentId ?? null, params),
    queryFn: () => {
      if (!studentId) {
        throw new Error('Student ID is required for attendance');
      }
      return analyticsService.getStudentAttendance(studentId, params);
    },
    enabled: Boolean(studentId),
    staleTime: 2 * 60 * 1000,
  });
}
