import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@elymica/api-client';

/**
 * Query keys for notification data
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...notificationKeys.lists(), filters] as const,
};

/**
 * Hook to fetch notifications
 */
export function useNotifications(
  notificationService: NotificationService,
  params?: {
    status?: 'unread' | 'read' | 'all';
    limit?: number;
    student_id?: string;
  }
) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.listNotifications(params),
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead(notificationService: NotificationService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead(
  notificationService: NotificationService
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

/**
 * Hook to send message
 */
export function useSendMessage(notificationService: NotificationService) {
  return useMutation({
    mutationFn: (request: {
      recipient_id: string;
      subject: string;
      message: string;
      priority?: 'normal' | 'urgent';
    }) => notificationService.sendMessage(request),
  });
}

/**
 * Hook to delete notification
 */
export function useDeleteNotification(notificationService: NotificationService) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useTeacherRecipients(
  notificationService: NotificationService,
  params?: { student_id?: string }
) {
  return useQuery({
    queryKey: ['teacherRecipients', params],
    queryFn: () => notificationService.listTeacherRecipients(params),
    staleTime: 10 * 60 * 1000,
  });
}

export function useParentRecipients(
  notificationService: NotificationService,
  params?: { class_id?: string; student_id?: string }
) {
  return useQuery({
    queryKey: ['parentRecipients', params],
    queryFn: () => notificationService.listParentRecipients(params),
    enabled: Boolean(params?.class_id || params?.student_id),
    staleTime: 10 * 60 * 1000,
  });
}
