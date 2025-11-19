import { z } from 'zod';

/**
 * Notification Service Type Definitions
 * Based on API-CONTRACT-DOCUMENTATION.md
 */

// Notification schema
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    'assignment_graded',
    'assignment_due',
    'announcement',
    'message',
    'system',
  ]),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  created_at: z.string().datetime(),
  action_url: z.string().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// List notifications response
export const ListNotificationsResponseSchema = z.object({
  success: z.boolean(),
  notifications: z.array(NotificationSchema),
  unread_count: z.number(),
});

export type ListNotificationsResponse = z.infer<typeof ListNotificationsResponseSchema>;

// Mark as read response
export const MarkAsReadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type MarkAsReadResponse = z.infer<typeof MarkAsReadResponseSchema>;

// Send message request
export const SendMessageRequestSchema = z.object({
  recipient_id: z.string().uuid(),
  subject: z.string(),
  message: z.string(),
  priority: z.enum(['normal', 'urgent']).optional(),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

// Teacher recipients
export const RecipientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.string().optional(),
  subject_area: z.string().optional(),
});

export type Recipient = z.infer<typeof RecipientSchema>;

export const ListRecipientsResponseSchema = z.object({
  success: z.boolean(),
  recipients: z.array(RecipientSchema),
});

export type ListRecipientsResponse = z.infer<typeof ListRecipientsResponseSchema>;
