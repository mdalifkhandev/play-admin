import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  listModerationReports,
  reviewModerationReport,
  type ModerationAction,
  type ModerationReportStatus,
  type ModerationTargetType,
} from './moderation';
import { dashboardQueryKeys } from './dashboard.query';

export const moderationQueryKeys = {
  all: ['moderation-reports'] as const,
  list: (params: { targetType?: ModerationTargetType; status?: ModerationReportStatus; page?: number; limit?: number }) =>
    [...moderationQueryKeys.all, 'list', params] as const,
};

export function useModerationReportsQuery(
  accessToken: string,
  params: { targetType?: ModerationTargetType; status?: ModerationReportStatus; page?: number; limit?: number },
) {
  return useQuery({
    queryKey: moderationQueryKeys.list(params),
    queryFn: () => listModerationReports(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useReviewModerationReportMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, action, reason }: { reportId: string; action: ModerationAction; reason?: string }) =>
      reviewModerationReport(accessToken, reportId, action, reason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: moderationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
