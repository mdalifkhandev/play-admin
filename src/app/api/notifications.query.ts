import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getAdminNotificationHistory,
  getAdminNotificationTemplates,
  sendAdminNotification,
  updateAdminNotification,
  type AdminNotificationAudience,
} from './notifications';
import { dashboardQueryKeys } from './dashboard.query';

export const adminNotificationQueryKeys = {
  all: ['admin-notification-management'] as const,
  history: (params: { page?: number; limit?: number }) =>
    [...adminNotificationQueryKeys.all, 'history', params] as const,
  templates: () => [...adminNotificationQueryKeys.all, 'templates'] as const,
};

export function useAdminNotificationHistoryQuery(
  accessToken: string,
  params: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: adminNotificationQueryKeys.history(params),
    queryFn: () => getAdminNotificationHistory(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useAdminNotificationTemplatesQuery(accessToken: string) {
  return useQuery({
    queryKey: adminNotificationQueryKeys.templates(),
    queryFn: () => getAdminNotificationTemplates(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 60_000,
  });
}

export function useSendAdminNotificationMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      title: string;
      body: string;
      audience: AdminNotificationAudience;
      userId?: string;
      notificationType?: string;
      deepLink?: string;
      schedule?: boolean;
      scheduledFor?: string;
    }) => sendAdminNotification(accessToken, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminNotificationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateAdminNotificationMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      input,
    }: {
      notificationId: string;
      input: {
        title?: string;
        body?: string;
        notificationType?: string;
        deepLink?: string | null;
      };
    }) => updateAdminNotification(accessToken, notificationId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminNotificationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
