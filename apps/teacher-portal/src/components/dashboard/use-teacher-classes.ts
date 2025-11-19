import { useQuery } from '@tanstack/react-query';

export interface TeacherClassSummary {
  id: string;
  name: string;
  gradeLevel: string;
  studentCount: number;
  assignmentsToGrade: number;
  nextSession: string;
}

const MOCK_CLASSES: TeacherClassSummary[] = [
  {
    id: 'class-stem',
    name: 'STEM Innovation Lab',
    gradeLevel: 'Grade 9',
    studentCount: 38,
    assignmentsToGrade: 6,
    nextSession: 'Today • 2:00 PM',
  },
  {
    id: 'class-english',
    name: 'African Literature',
    gradeLevel: 'Grade 11',
    studentCount: 32,
    assignmentsToGrade: 3,
    nextSession: 'Tomorrow • 9:00 AM',
  },
  {
    id: 'class-math',
    name: 'Mathematics Level 4',
    gradeLevel: 'Grade 10',
    studentCount: 40,
    assignmentsToGrade: 0,
    nextSession: 'Friday • 11:00 AM',
  },
];

export function useTeacherClasses() {
  return useQuery({
    queryKey: ['teacher', 'classes'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 120));
      return MOCK_CLASSES;
    },
    staleTime: 5 * 60 * 1000,
  });
}
