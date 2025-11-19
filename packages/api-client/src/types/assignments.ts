import { z } from 'zod';

/**
 * Assignment Service Type Definitions
 * Based on API-CONTRACT-DOCUMENTATION.md
 */

// Assignment schema
export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  course_title: z.string(),
  due_date: z.string().datetime(),
  max_score: z.number(),
  submission_status: z.enum(['pending', 'submitted', 'graded']),
  score: z.number().nullable(),
});

export type Assignment = z.infer<typeof AssignmentSchema>;

// List assignments response
export const ListAssignmentsResponseSchema = z.object({
  success: z.boolean(),
  assignments: z.array(AssignmentSchema),
});

export type ListAssignmentsResponse = z.infer<typeof ListAssignmentsResponseSchema>;

// Assignment feedback
export const AssignmentFeedbackSchema = z.object({
  score: z.number(),
  grade: z.string(),
  teacher_comments: z.string(),
  graded_at: z.string().datetime(),
});

export type AssignmentFeedback = z.infer<typeof AssignmentFeedbackSchema>;

// Get feedback response
export const GetFeedbackResponseSchema = z.object({
  success: z.boolean(),
  feedback: AssignmentFeedbackSchema,
});

export type GetFeedbackResponse = z.infer<typeof GetFeedbackResponseSchema>;
