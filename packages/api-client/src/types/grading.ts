import { z } from 'zod';

/**
 * Grading Service Type Definitions
 * Based on API-CONTRACT-DOCUMENTATION.md
 */

// Recent score schema
export const RecentScoreSchema = z.object({
  assignment_title: z.string(),
  score: z.number(),
  max_score: z.number(),
});

export type RecentScore = z.infer<typeof RecentScoreSchema>;

// Course grade schema
export const CourseGradeSchema = z.object({
  course_title: z.string(),
  current_grade: z.string(),
  percentage: z.number(),
  recent_scores: z.array(RecentScoreSchema),
});

export type CourseGrade = z.infer<typeof CourseGradeSchema>;

// Grade summary
export const GradeSummarySchema = z.object({
  overall_gpa: z.number(),
  average_percentage: z.number(),
});

export type GradeSummary = z.infer<typeof GradeSummarySchema>;

// Get student grades response
export const GetStudentGradesResponseSchema = z.object({
  success: z.boolean(),
  summary: GradeSummarySchema,
  grades_by_course: z.array(CourseGradeSchema),
});

export type GetStudentGradesResponse = z.infer<typeof GetStudentGradesResponseSchema>;

// Submit grade request/response
export const SubmitGradeRequestSchema = z.object({
  score: z.number(),
  max_score: z.number().optional(),
  grade: z.string().optional(),
  teacher_comments: z.string().optional(),
  published: z.boolean().optional(),
});

export type SubmitGradeRequest = z.infer<typeof SubmitGradeRequestSchema>;

export const SubmitGradeResponseSchema = z.object({
  success: z.boolean(),
  assignment_id: z.string().uuid(),
  score: z.number(),
  grade: z.string().optional(),
  published_at: z.string().datetime().optional(),
});

export type SubmitGradeResponse = z.infer<typeof SubmitGradeResponseSchema>;
