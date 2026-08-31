import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getAdminSupportRequest,
  listAdminSupportRequests,
  replyAdminSupportRequest,
  updateAdminSupportRequest,
  type SupportPriority,
  type SupportRequestStatus,
} from './supportRequests';
import { dashboardQueryKeys } from './dashboard.query';

export const supportRequestQueryKeys = {
  all: ['admin-support-requests'] as const,
  list: (params: { page?: number; limit?: number; status?: SupportRequestStatus }) =>
    [...supportRequestQueryKeys.all, 'list', params] as const,
  detail: (requestId?: string) => [...supportRequestQueryKeys.all, 'detail', requestId] as const,
};

export function useAdminSupportRequestsQuery(
  accessToken: string,
  params: { page?: number; limit?: number; status?: SupportRequestStatus },
) {
  return useQuery({
    queryKey: supportRequestQueryKeys.list(params),
    queryFn: () => listAdminSupportRequests(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useAdminSupportRequestDetailQuery(accessToken: string, requestId?: string) {
  return useQuery({
    queryKey: supportRequestQueryKeys.detail(requestId),
    queryFn: () => getAdminSupportRequest(accessToken, requestId || ''),
    enabled: Boolean(accessToken && requestId),
    staleTime: 5_000,
  });
}

export function useReplyAdminSupportRequestMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, message }: { requestId: string; message: string }) =>
      replyAdminSupportRequest(accessToken, requestId, message),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: supportRequestQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: supportRequestQueryKeys.detail(variables.requestId), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateAdminSupportRequestMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      input,
    }: {
      requestId: string;
      input: { status?: SupportRequestStatus; priority?: SupportPriority; assignedTo?: string | null };
    }) => updateAdminSupportRequest(accessToken, requestId, input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: supportRequestQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: supportRequestQueryKeys.detail(variables.requestId), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
