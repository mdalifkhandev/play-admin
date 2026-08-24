import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminRewardProgram,
  finalizeAdminRewardWinners,
  getAdminRewardDashboard,
  updateAdminRewardProgram,
  updateAdminRewardSettings,
  updateAdminRewardWinnerStatus,
  type AdminRewardProgram,
  type AdminRewardProgramInput,
  type AdminRewardSettings,
  type AdminRewardWinner,
} from './rewards';

export const rewardQueryKeys = {
  all: ['admin-rewards'] as const,
  dashboard: () => [...rewardQueryKeys.all, 'dashboard'] as const,
};

export function useAdminRewardDashboardQuery(accessToken: string) {
  return useQuery({
    queryKey: rewardQueryKeys.dashboard(),
    queryFn: () => getAdminRewardDashboard(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useUpdateAdminRewardSettingsMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminRewardSettings) => updateAdminRewardSettings(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rewardQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useCreateAdminRewardProgramMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminRewardProgramInput) => createAdminRewardProgram(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rewardQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useUpdateAdminRewardProgramMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, input }: { programId: string; input: Partial<AdminRewardProgramInput> }) =>
      updateAdminRewardProgram(accessToken, programId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rewardQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useFinalizeAdminRewardWinnersMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { programId?: string; limit?: number; cycleLabel?: string }) =>
      finalizeAdminRewardWinners(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rewardQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useUpdateAdminRewardWinnerStatusMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ winnerId, status }: { winnerId: string; status: AdminRewardWinner['status'] }) =>
      updateAdminRewardWinnerStatus(accessToken, winnerId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: rewardQueryKeys.all, refetchType: 'all' });
    },
  });
}

export type { AdminRewardProgram };
