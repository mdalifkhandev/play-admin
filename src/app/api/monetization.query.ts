import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMonetizationDashboard,
  releasePendingCreatorEarnings,
  updateCreatorRequirementSettings,
  updateMonetizationSettings,
  type CreatorRequirementSettings,
} from './monetization';
import { dashboardQueryKeys } from './dashboard.query';

export const monetizationQueryKeys = {
  all: ['admin-monetization'] as const,
  dashboard: () => [...monetizationQueryKeys.all, 'dashboard'] as const,
};

export function useMonetizationDashboardQuery(accessToken: string) {
  return useQuery({
    queryKey: monetizationQueryKeys.dashboard(),
    queryFn: () => getMonetizationDashboard(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useReleasePendingCreatorEarningsMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => releasePendingCreatorEarnings(accessToken),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateMonetizationSettingsMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (creatorSharePercent: number) => updateMonetizationSettings(accessToken, creatorSharePercent),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateCreatorRequirementSettingsMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: CreatorRequirementSettings) => updateCreatorRequirementSettings(accessToken, settings),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
