import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminAdPackage,
  createAdminAdCategory,
  deleteAdminAdPackage,
  deleteAdminAdCategory,
  listAdminAdPackages,
  listAdminAdCategories,
  listAdminAds,
  reviewAdminAd,
  updateAdminAdPackage,
  updateAdminAdCategory,
  type AdCampaignStatus,
  type CreateAdPackagePayload,
  type CreateAdCategoryPayload,
  type UpdateAdPackagePayload,
  type UpdateAdCategoryPayload,
} from './ads';
import { dashboardQueryKeys } from './dashboard.query';
import { monetizationQueryKeys } from './monetization.query';

export const adQueryKeys = {
  all: ['admin-ads'] as const,
  list: (params: { status?: AdCampaignStatus; limit?: number; cursor?: string | null }) =>
    [...adQueryKeys.all, 'list', params] as const,
  packages: ['admin-ad-packages'] as const,
  categories: ['admin-ad-categories'] as const,
};

export function useAdminAdsQuery(
  accessToken: string,
  params: { status?: AdCampaignStatus; limit?: number; cursor?: string | null },
) {
  return useQuery({
    queryKey: adQueryKeys.list(params),
    queryFn: () => listAdminAds(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useAdminAdPackagesQuery(accessToken: string) {
  return useQuery({
    queryKey: adQueryKeys.packages,
    queryFn: () => listAdminAdPackages(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useCreateAdminAdPackageMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdPackagePayload) => createAdminAdPackage(accessToken, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adQueryKeys.packages });
    },
  });
}

export function useUpdateAdminAdPackageMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      packageId,
      payload,
    }: {
      packageId: string;
      payload: UpdateAdPackagePayload;
    }) => updateAdminAdPackage(accessToken, packageId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adQueryKeys.packages });
    },
  });
}

export function useDeleteAdminAdPackageMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) => deleteAdminAdPackage(accessToken, packageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adQueryKeys.packages });
    },
  });
}

export function useAdminAdCategoriesQuery(accessToken: string) {
  return useQuery({
    queryKey: adQueryKeys.categories,
    queryFn: () => listAdminAdCategories(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useCreateAdminAdCategoryMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdCategoryPayload) => createAdminAdCategory(accessToken, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adQueryKeys.categories });
    },
  });
}

export function useUpdateAdminAdCategoryMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: UpdateAdCategoryPayload;
    }) => updateAdminAdCategory(accessToken, categoryId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adQueryKeys.categories });
    },
  });
}

export function useDeleteAdminAdCategoryMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteAdminAdCategory(accessToken, categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adQueryKeys.categories });
    },
  });
}

export function useReviewAdminAdMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      adId,
      action,
      reason,
    }: {
      adId: string;
      action: 'approve' | 'reject' | 'hold' | 'pause' | 'resume' | 'cancel';
      reason?: string;
    }) => reviewAdminAd(accessToken, adId, action, reason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
