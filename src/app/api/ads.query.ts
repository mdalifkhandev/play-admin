import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  listAdminAds,
  reviewAdminAd,
  type AdCampaignStatus,
} from './ads';

export const adQueryKeys = {
  all: ['admin-ads'] as const,
  list: (params: { status?: AdCampaignStatus; limit?: number; cursor?: string | null }) =>
    [...adQueryKeys.all, 'list', params] as const,
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adQueryKeys.all });
    },
  });
}
