import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  dismissAdminLiveStreamReport,
  forceEndAdminLiveStream,
  listAdminLiveStreams,
  listAdminRecordedLiveStreams,
  type AdminLiveStreamStatus,
} from './liveStreams';
import { dashboardQueryKeys } from './dashboard.query';
import { moderationQueryKeys } from './moderation.query';

export const liveStreamQueryKeys = {
  all: ['admin-live-streams'] as const,
  list: (params: { status?: AdminLiveStreamStatus; reported?: boolean; page?: number; limit?: number }) =>
    [...liveStreamQueryKeys.all, 'list', params] as const,
  recorded: (params: { page?: number; limit?: number }) =>
    [...liveStreamQueryKeys.all, 'recorded', params] as const,
};

export function useAdminLiveStreamsQuery(
  accessToken: string,
  params: { status?: AdminLiveStreamStatus; reported?: boolean; page?: number; limit?: number },
) {
  return useQuery({
    queryKey: liveStreamQueryKeys.list(params),
    queryFn: () => listAdminLiveStreams(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useAdminRecordedLiveStreamsQuery(
  accessToken: string,
  params: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: liveStreamQueryKeys.recorded(params),
    queryFn: () => listAdminRecordedLiveStreams(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

export function useForceEndAdminLiveStreamMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamId: string) => forceEndAdminLiveStream(accessToken, streamId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: liveStreamQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useDismissAdminLiveStreamReportMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => dismissAdminLiveStreamReport(accessToken, reportId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: liveStreamQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: moderationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
