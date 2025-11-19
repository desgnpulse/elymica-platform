import { z } from 'zod';

/**
 * Enrollment Service Type Definitions
 */

export const ParentChildSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string().optional(),
  grade_level: z.string(),
  relationship: z.string(),
  enrolled_courses: z.number().optional(),
  overall_grade: z.string().optional(),
  attendance_percentage: z.number().optional(),
});

export type ParentChild = z.infer<typeof ParentChildSchema>;

export const GetParentChildrenResponseSchema = z.object({
  success: z.boolean(),
  children: z.array(ParentChildSchema),
});

export type GetParentChildrenResponse = z.infer<typeof GetParentChildrenResponseSchema>;

// Class roster
export const ClassRosterStudentSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  guardian_name: z.string().optional(),
  guardian_contact: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type ClassRosterStudent = z.infer<typeof ClassRosterStudentSchema>;

export const ClassRosterResponseSchema = z.object({
  success: z.boolean(),
  students: z.array(ClassRosterStudentSchema),
});

export type ClassRosterResponse = z.infer<typeof ClassRosterResponseSchema>;
