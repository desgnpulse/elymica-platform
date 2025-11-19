import { z } from 'zod';

/**
 * Content Service Type Definitions
 */

export const LessonContentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: z.enum(['video', 'text', 'quiz', 'interactive']),
  content: z.record(z.any()),
  resources: z
    .array(
      z.object({
        title: z.string(),
        type: z.string(),
        url: z.string().url(),
      })
    )
    .optional(),
});

export type LessonContent = z.infer<typeof LessonContentSchema>;

export const GetLessonResponseSchema = z.object({
  success: z.boolean(),
  lesson: LessonContentSchema,
});

export type GetLessonResponse = z.infer<typeof GetLessonResponseSchema>;

export const CreateLessonRequestSchema = z.object({
  title: z.string(),
  type: z.enum(['video', 'text', 'quiz', 'interactive']),
  content: z.record(z.any()),
  module_id: z.string().uuid().optional(),
});

export type CreateLessonRequest = z.infer<typeof CreateLessonRequestSchema>;

export const CreateLessonResponseSchema = z.object({
  success: z.boolean(),
  lesson: LessonContentSchema,
});

export type CreateLessonResponse = z.infer<typeof CreateLessonResponseSchema>;

export const CreateModuleRequestSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  course_id: z.string().uuid(),
});

export type CreateModuleRequest = z.infer<typeof CreateModuleRequestSchema>;

export const CreateModuleResponseSchema = z.object({
  success: z.boolean(),
  module: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().optional(),
  }),
});

export type CreateModuleResponse = z.infer<typeof CreateModuleResponseSchema>;
