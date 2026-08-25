import { useQuery } from '@tanstack/react-query';

import { getAdminDashboardSummary } from './dashboard';

export const dashboardQueryKeys = {
  all: ['admin-dashboard'] as const,
  summary: () => [...dashboardQueryKeys.all, 'summary'] as const,
};

export function useAdminDashboardSummaryQuery(accessToken: string) {
  return useQuery({
    queryKey: dashboardQueryKeys.summary(),
    queryFn: () => getAdminDashboardSummary(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}
