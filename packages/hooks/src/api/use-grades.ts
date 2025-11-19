import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GradingService, SubmitGradeRequest } from '@elymica/api-client';

/**
 * Query keys for grading data
 */
export const gradeKeys = {
  all: ['grades'] as const,
  student: (studentId: string) => [...gradeKeys.all, 'student', studentId] as const,
  studentCourse: (studentId: string, courseId?: string) =>
    [...gradeKeys.student(studentId), courseId] as const,
};

/**
 * Hook to fetch student grades
 */
export function useStudentGrades(
  gradingService: GradingService,
  studentId: string,
  courseId?: string
) {
  return useQuery({
    queryKey: gradeKeys.studentCourse(studentId, courseId),
    queryFn: () => gradingService.getStudentGrades(studentId, courseId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubmitGrade(gradingService: GradingService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      payload,
    }: {
      assignmentId: string;
      payload: SubmitGradeRequest;
    }) => gradingService.submitGrade(assignmentId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.all });
      queryClient.invalidateQueries({ queryKey: ['assignments', variables.assignmentId] });
    },
  });
}
