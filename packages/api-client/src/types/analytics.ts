import { z } from 'zod';

/**
 * Analytics Service Type Definitions
 */

export const AttendanceRecordSchema = z.object({
  date: z.string(),
  status: z.enum(['present', 'absent', 'late']),
  time_in: z.string().nullable().optional(),
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

export const AttendanceSummarySchema = z.object({
  total_days: z.number(),
  present: z.number(),
  attendance_percentage: z.number(),
});

export type AttendanceSummary = z.infer<typeof AttendanceSummarySchema>;

export const AttendanceResponseSchema = z.object({
  success: z.boolean(),
  attendance: z.object({
    summary: AttendanceSummarySchema,
    records: z.array(AttendanceRecordSchema),
  }),
});

export type AttendanceResponse = z.infer<typeof AttendanceResponseSchema>;
