import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminCoinPackage,
  createAdminGift,
  deleteAdminCoinPackage,
  deleteAdminGift,
  getAdminCoinSettings,
  listAdminCoinPackages,
  listAdminCoinTransactions,
  listAdminGifts,
  updateAdminCoinPackage,
  updateAdminCoinSettings,
  updateAdminGift,
  type AdminCoinPackage,
  type AdminCoinSettings,
  type AdminGift,
} from './coinGift';

export const coinGiftQueryKeys = {
  all: ['admin-coin-gift'] as const,
  packages: () => [...coinGiftQueryKeys.all, 'packages'] as const,
  gifts: () => [...coinGiftQueryKeys.all, 'gifts'] as const,
  settings: () => [...coinGiftQueryKeys.all, 'settings'] as const,
  transactions: (params: { page?: number; limit?: number }) =>
    [...coinGiftQueryKeys.all, 'transactions', params] as const,
};

export function useAdminCoinPackagesQuery(accessToken: string) {
  return useQuery({
    queryKey: coinGiftQueryKeys.packages(),
    queryFn: () => listAdminCoinPackages(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useAdminGiftsQuery(accessToken: string) {
  return useQuery({
    queryKey: coinGiftQueryKeys.gifts(),
    queryFn: () => listAdminGifts(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useAdminCoinSettingsQuery(accessToken: string) {
  return useQuery({
    queryKey: coinGiftQueryKeys.settings(),
    queryFn: () => getAdminCoinSettings(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useAdminCoinTransactionsQuery(accessToken: string, params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: coinGiftQueryKeys.transactions(params),
    queryFn: () => listAdminCoinTransactions(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useCreateAdminCoinPackageMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<AdminCoinPackage>) => createAdminCoinPackage(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinGiftQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useUpdateAdminCoinPackageMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ packageId, input }: { packageId: string; input: Partial<AdminCoinPackage> }) =>
      updateAdminCoinPackage(accessToken, packageId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinGiftQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useDeleteAdminCoinPackageMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (packageId: string) => deleteAdminCoinPackage(accessToken, packageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinGiftQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useCreateAdminGiftMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<AdminGift>) => createAdminGift(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinGiftQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useUpdateAdminGiftMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ giftId, input }: { giftId: string; input: Partial<AdminGift> }) =>
      updateAdminGift(accessToken, giftId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinGiftQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useDeleteAdminGiftMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (giftId: string) => deleteAdminGift(accessToken, giftId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinGiftQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useUpdateAdminCoinSettingsMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminCoinSettings) => updateAdminCoinSettings(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coinGiftQueryKeys.all, refetchType: 'all' });
    },
  });
}
