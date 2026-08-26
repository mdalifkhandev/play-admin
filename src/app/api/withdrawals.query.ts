import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  approveAdminWithdrawal,
  listAdminWithdrawals,
  rejectAdminWithdrawal,
  type AdminWithdrawalListParams,
} from './withdrawals';
import { dashboardQueryKeys } from './dashboard.query';
import { monetizationQueryKeys } from './monetization.query';

export const withdrawalsQueryKeys = {
  all: ['admin-withdrawals'] as const,
  list: (params: AdminWithdrawalListParams) => [...withdrawalsQueryKeys.all, 'list', params] as const,
};

export function useAdminWithdrawalsQuery(accessToken: string, params: AdminWithdrawalListParams) {
  return useQuery({
    queryKey: withdrawalsQueryKeys.list(params),
    queryFn: () => listAdminWithdrawals(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useApproveAdminWithdrawalMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, adminNotes }: { requestId: string; adminNotes?: string }) =>
      approveAdminWithdrawal(accessToken, requestId, adminNotes),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: withdrawalsQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useRejectAdminWithdrawalMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      rejectAdminWithdrawal(accessToken, requestId, reason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: withdrawalsQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
