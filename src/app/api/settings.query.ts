import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getAdminPlatformSettings,
  updateAdminPlatformSettings,
  type UpdatePlatformSettingsInput,
} from './settings';
import { dashboardQueryKeys } from './dashboard.query';

export const settingsQueryKeys = {
  all: ['admin-settings'] as const,
  detail: () => [...settingsQueryKeys.all, 'detail'] as const,
};

export function useAdminPlatformSettingsQuery(accessToken: string) {
  return useQuery({
    queryKey: settingsQueryKeys.detail(),
    queryFn: () => getAdminPlatformSettings(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useUpdateAdminPlatformSettingsMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePlatformSettingsInput) => updateAdminPlatformSettings(accessToken, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
