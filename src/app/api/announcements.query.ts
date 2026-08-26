import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  listAdminAnnouncements,
  updateAdminAnnouncement,
  type AnnouncementStatus,
  type CreateAdminAnnouncementInput,
  type UpdateAdminAnnouncementInput,
} from './announcements';
import { dashboardQueryKeys } from './dashboard.query';
import { adminNotificationQueryKeys } from './notifications.query';

export const announcementQueryKeys = {
  all: ['admin-announcements'] as const,
  list: (params: { page?: number; limit?: number; status?: AnnouncementStatus }) =>
    [...announcementQueryKeys.all, 'list', params] as const,
};

export function useAdminAnnouncementsQuery(
  accessToken: string,
  params: { page?: number; limit?: number; status?: AnnouncementStatus },
) {
  return useQuery({
    queryKey: announcementQueryKeys.list(params),
    queryFn: () => listAdminAnnouncements(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useCreateAdminAnnouncementMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdminAnnouncementInput) => createAdminAnnouncement(accessToken, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: announcementQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: adminNotificationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateAdminAnnouncementMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      announcementId,
      input,
    }: {
      announcementId: string;
      input: UpdateAdminAnnouncementInput;
    }) => updateAdminAnnouncement(accessToken, announcementId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: announcementQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: adminNotificationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useDeleteAdminAnnouncementMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId: string) => deleteAdminAnnouncement(accessToken, announcementId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: announcementQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: adminNotificationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
