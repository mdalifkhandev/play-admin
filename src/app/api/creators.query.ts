import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  approveCreatorApplication,
  getAdminCreatorAnalytics,
  holdCreatorApplication,
  listCreatorApplications,
  rejectCreatorApplication,
  type CreatorAnalyticsRange,
  type CreatorApplicationStatus,
} from './creators';
import { dashboardQueryKeys } from './dashboard.query';
import { monetizationQueryKeys } from './monetization.query';

export const creatorQueryKeys = {
  all: ['creator-applications'] as const,
  list: (status?: CreatorApplicationStatus) => [...creatorQueryKeys.all, 'list', status ?? 'all'] as const,
  analytics: (userId?: string, range?: CreatorAnalyticsRange) =>
    [...creatorQueryKeys.all, 'analytics', userId ?? '', range ?? '28d'] as const,
};

export function useCreatorApplicationsQuery(accessToken: string, status?: CreatorApplicationStatus) {
  return useQuery({
    queryKey: creatorQueryKeys.list(status),
    queryFn: () => listCreatorApplications(accessToken, status),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useAdminCreatorAnalyticsQuery(
  accessToken: string,
  userId?: string,
  range: CreatorAnalyticsRange = '28d',
) {
  return useQuery({
    queryKey: creatorQueryKeys.analytics(userId, range),
    queryFn: () => getAdminCreatorAnalytics(accessToken, userId || '', range),
    enabled: Boolean(accessToken && userId),
    staleTime: 15_000,
  });
}

export function useApproveCreatorApplicationMutation(accessToken: string) {
  return useReviewMutation<string>((id) => approveCreatorApplication(accessToken, id));
}

export function useRejectCreatorApplicationMutation(accessToken: string) {
  return useReviewMutation<{ id: string; reason?: string }>(({ id, reason }) =>
    rejectCreatorApplication(accessToken, id, reason),
  );
}

export function useHoldCreatorApplicationMutation(accessToken: string) {
  return useReviewMutation<{ id: string; reason?: string }>(({ id, reason }) =>
    holdCreatorApplication(accessToken, id, reason),
  );
}

function useReviewMutation<TInput>(
  action: (input: TInput) => Promise<{ id: string; status: CreatorApplicationStatus }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: creatorQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
