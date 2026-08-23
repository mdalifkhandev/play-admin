import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getMonetizationDashboard,
  updateCreatorRequirementSettings,
  updateMonetizationSettings,
  type CreatorRequirementSettings,
} from './monetization';

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

export function useUpdateMonetizationSettingsMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (creatorSharePercent: number) => updateMonetizationSettings(accessToken, creatorSharePercent),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useUpdateCreatorRequirementSettingsMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: CreatorRequirementSettings) => updateCreatorRequirementSettings(accessToken, settings),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' });
    },
  });
}
