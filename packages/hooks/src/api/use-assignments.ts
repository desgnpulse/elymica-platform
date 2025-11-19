import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AssignmentService } from '@elymica/api-client';

/**
 * Query keys for assignment data
 */
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...assignmentKeys.lists(), filters] as const,
  feedback: (id: string) => [...assignmentKeys.all, 'feedback', id] as const,
};

/**
 * Hook to fetch assignments
 */
export function useAssignments(
  assignmentService: AssignmentService,
  params?: {
    course_id?: string;
    status?: 'pending' | 'submitted' | 'graded';
    student_id?: string;
  }
) {
  return useQuery({
    queryKey: assignmentKeys.list(params),
    queryFn: () => assignmentService.listAssignments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to submit assignment
 */
export function useSubmitAssignment(assignmentService: AssignmentService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      file,
      notes,
    }: {
      assignmentId: string;
      file: File;
      notes?: string;
    }) => assignmentService.submitAssignment(assignmentId, file, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}

/**
 * Hook to get assignment feedback
 */
export function useAssignmentFeedback(
  assignmentService: AssignmentService,
  assignmentId: string
) {
  return useQuery({
    queryKey: assignmentKeys.feedback(assignmentId),
    queryFn: () => assignmentService.getFeedback(assignmentId),
    enabled: !!assignmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
