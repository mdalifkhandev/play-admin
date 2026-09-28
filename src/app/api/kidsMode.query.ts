import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  dismissAdminKidsModeReport,
  getAdminKidsModeStats,
  listAdminKidsModeContent,
  listAdminKidsModeReports,
  removeAdminKidsModeReport,
  updateAdminKidsModeContent,
} from './kidsMode';

export const kidsModeQueryKeys = {
  all: ['admin-kids-mode'] as const,
  content: (params: { page?: number; limit?: number; kidFriendly?: 'all' | 'yes' | 'no' }) =>
    [...kidsModeQueryKeys.all, 'content', params] as const,
  reports: (params: { page?: number; limit?: number }) => [...kidsModeQueryKeys.all, 'reports', params] as const,
  stats: () => [...kidsModeQueryKeys.all, 'stats'] as const,
};

export function useAdminKidsModeContentQuery(
  accessToken: string,
  params: { page?: number; limit?: number; kidFriendly?: 'all' | 'yes' | 'no' },
) {
  return useQuery({
    queryKey: kidsModeQueryKeys.content(params),
    queryFn: () => listAdminKidsModeContent(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useAdminKidsModeReportsQuery(accessToken: string, params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: kidsModeQueryKeys.reports(params),
    queryFn: () => listAdminKidsModeReports(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useAdminKidsModeStatsQuery(accessToken: string) {
  return useQuery({
    queryKey: kidsModeQueryKeys.stats(),
    queryFn: () => getAdminKidsModeStats(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useUpdateAdminKidsModeContentMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reelId, forKids }: { reelId: string; forKids: boolean }) =>
      updateAdminKidsModeContent(accessToken, reelId, forKids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: kidsModeQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useRemoveAdminKidsModeReportMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reelId: string) => removeAdminKidsModeReport(accessToken, reelId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: kidsModeQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useDismissAdminKidsModeReportMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reelId: string) => dismissAdminKidsModeReport(accessToken, reelId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: kidsModeQueryKeys.all, refetchType: 'all' });
    },
  });
}
