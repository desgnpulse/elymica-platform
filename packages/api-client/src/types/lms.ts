import { z } from 'zod';

/**
 * LMS Service Type Definitions
 * Based on API-CONTRACT-DOCUMENTATION.md
 */

// Course schema
export const CourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  instructor_name: z.string(),
  thumbnail_url: z.string().url().optional(),
  enrollment_count: z.number(),
  lesson_count: z.number(),
  enrolled: z.boolean(),
  progress_percentage: z.number().min(0).max(100).optional(),
});

export type Course = z.infer<typeof CourseSchema>;

// Lesson schema
export const LessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: z.enum(['video', 'text', 'quiz', 'interactive']),
  duration_minutes: z.number().optional(),
  completed: z.boolean(),
});

export type Lesson = z.infer<typeof LessonSchema>;

// Module/Week schema
export const ModuleSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  lessons: z.array(LessonSchema),
});

export type Module = z.infer<typeof ModuleSchema>;

// Course progress
export const CourseProgressSchema = z.object({
  completed_lessons: z.number(),
  total_lessons: z.number(),
  percentage: z.number().min(0).max(100),
});

export type CourseProgress = z.infer<typeof CourseProgressSchema>;

// Course details
export const CourseDetailsSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  syllabus: z.array(ModuleSchema),
  progress: CourseProgressSchema,
});

export type CourseDetails = z.infer<typeof CourseDetailsSchema>;

// List courses response
export const ListCoursesResponseSchema = z.object({
  success: z.boolean(),
  courses: z.array(CourseSchema),
  pagination: z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

export type ListCoursesResponse = z.infer<typeof ListCoursesResponseSchema>;

// Get course details response
export const GetCourseDetailsResponseSchema = z.object({
  success: z.boolean(),
  course: CourseDetailsSchema,
});

export type GetCourseDetailsResponse = z.infer<typeof GetCourseDetailsResponseSchema>;

// Enroll response
export const EnrollResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type EnrollResponse = z.infer<typeof EnrollResponseSchema>;
