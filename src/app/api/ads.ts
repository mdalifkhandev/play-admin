import { apiClient, authHeaders, getApiData } from './client';

export type AdCampaignStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'active'
  | 'paused'
  | 'held'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type AdCampaign = {
  id: string;
  ownerId: string;
  owner: {
    id: string;
    email?: string;
    displayName?: string;
    username?: string;
    photoUrl?: string;
  } | null;
  category: string;
  days: number;
  budgetUsd: number;
  targetUsers: number;
  placement: 'feed';
  audienceType: 'same_interest' | 'interest_in_topic' | 'all_users';
  areaType: 'city' | 'country' | 'world';
  city: string | null;
  country: string | null;
  mediaAssetId: string | null;
  mediaKey: string | null;
  mediaUrl: string | null;
  title: string | null;
  description: string | null;
  destinationUrl: string | null;
  ctaType: 'none' | 'learn_more' | 'send_message';
  ctaLabel: string | null;
  status: AdCampaignStatus;
  adminReason: string | null;
  startsAt: string | null;
  endsAt: string | null;
  pausedAt: string | null;
  heldAt: string | null;
  metrics: {
    impressions: number;
    clicks: number;
    spendUsd: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type AdCampaignListResult = {
  items: AdCampaign[];
  nextCursor: string | null;
};

export async function listAdminAds(
  accessToken: string,
  params: { status?: AdCampaignStatus; limit?: number; cursor?: string | null },
) {
  return getApiData<AdCampaignListResult>(
    await apiClient.get('/admin/ads', {
      headers: authHeaders(accessToken),
      params: {
        status: params.status,
        limit: params.limit ?? 50,
        cursor: params.cursor || undefined,
      },
    }),
  );
}

export async function reviewAdminAd(
  accessToken: string,
  adId: string,
  action: 'approve' | 'reject' | 'hold' | 'pause' | 'resume' | 'cancel',
  reason?: string,
) {
  return getApiData<AdCampaign>(
    await apiClient.patch(
      `/admin/ads/${adId}/${action}`,
      reason ? { reason } : {},
      { headers: authHeaders(accessToken) },
    ),
  );
}
