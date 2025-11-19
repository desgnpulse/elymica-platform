import { AxiosInstance } from 'axios';
import {
  ListNotificationsResponse,
  ListNotificationsResponseSchema,
  MarkAsReadResponse,
  MarkAsReadResponseSchema,
  SendMessageRequest,
  ListRecipientsResponse,
  ListRecipientsResponseSchema,
} from '../types/notifications';

/**
 * Notification Service API Client
 * Notifications, messages, announcements
 */
export class NotificationService {
  constructor(private client: AxiosInstance) {}

  /**
   * Get user notifications
   */
  async listNotifications(params?: {
    status?: 'unread' | 'read' | 'all';
    limit?: number;
    student_id?: string;
  }): Promise<ListNotificationsResponse> {
    const { data } = await this.client.get('/notifications', { params });
    return ListNotificationsResponseSchema.parse(data);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<MarkAsReadResponse> {
    const { data } = await this.client.patch(`/notifications/${notificationId}/read`);
    return MarkAsReadResponseSchema.parse(data);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<MarkAsReadResponse> {
    const { data } = await this.client.patch('/notifications/mark-all-read');
    return MarkAsReadResponseSchema.parse(data);
  }

  /**
   * Send message to parent/teacher
   */
  async sendMessage(request: SendMessageRequest): Promise<void> {
    await this.client.post('/messages', request);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.client.delete(`/notifications/${notificationId}`);
  }

  /**
   * List teacher recipients (future API integration)
   */
  async listTeacherRecipients(params?: { student_id?: string }): Promise<ListRecipientsResponse> {
    const { data } = await this.client.get('/messages/recipients/teachers', { params });
    return ListRecipientsResponseSchema.parse(data);
  }

  /**
   * List parent recipients for messaging (teacher portal)
   */
  async listParentRecipients(params?: { class_id?: string; student_id?: string }): Promise<ListRecipientsResponse> {
    const { data } = await this.client.get('/messages/recipients/parents', { params });
    return ListRecipientsResponseSchema.parse(data);
  }
}
