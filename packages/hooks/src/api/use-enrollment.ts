import { useQuery } from '@tanstack/react-query';
import { EnrollmentService } from '@elymica/api-client';

export const parentKeys = {
  all: ['parent'] as const,
  children: (parentId: string | null) => [...parentKeys.all, 'children', parentId] as const,
};

export function useParentChildren(enrollmentService: EnrollmentService, parentId?: string | null) {
  return useQuery({
    queryKey: parentKeys.children(parentId ?? null),
    queryFn: () => {
      if (!parentId) {
        throw new Error('Parent ID is required to load children');
      }
      return enrollmentService.getParentChildren(parentId);
    },
    enabled: Boolean(parentId),
    staleTime: 5 * 60 * 1000,
  });
}

export const classKeys = {
  all: ['classes'] as const,
  roster: (classId: string | null) => [...classKeys.all, 'roster', classId] as const,
};

export function useClassRoster(enrollmentService: EnrollmentService, classId?: string | null) {
  return useQuery({
    queryKey: classKeys.roster(classId ?? null),
    queryFn: () => {
      if (!classId) {
        throw new Error('Class ID is required to load roster');
      }
      return enrollmentService.getClassRoster(classId);
    },
    enabled: Boolean(classId),
    staleTime: 5 * 60 * 1000,
  });
}
