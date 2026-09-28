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

export type AdPackage = {
  id: string;
  name: string;
  days: number;
  priceUsd: number;
  targetUsers: number;
  description?: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdPackagePayload = {
  name: string;
  days: number;
  priceUsd: number;
  targetUsers: number;
  description?: string;
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdateAdPackagePayload = Partial<CreateAdPackagePayload>;

export async function listAdminAdPackages(accessToken: string) {
  return getApiData<AdPackage[]>(
    await apiClient.get('/admin/ads/packages', {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function createAdminAdPackage(accessToken: string, payload: CreateAdPackagePayload) {
  return getApiData<AdPackage>(
    await apiClient.post('/admin/ads/packages', payload, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function updateAdminAdPackage(
  accessToken: string,
  packageId: string,
  payload: UpdateAdPackagePayload,
) {
  return getApiData<AdPackage>(
    await apiClient.put(`/admin/ads/packages/${packageId}`, payload, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function deleteAdminAdPackage(accessToken: string, packageId: string) {
  return getApiData<{ id: string; deleted: boolean }>(
    await apiClient.delete(`/admin/ads/packages/${packageId}`, {
      headers: authHeaders(accessToken),
    }),
  );
}

export type AdCategory = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateAdCategoryPayload = {
  name: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdateAdCategoryPayload = Partial<CreateAdCategoryPayload>;

export async function listAdminAdCategories(accessToken: string) {
  return getApiData<AdCategory[]>(
    await apiClient.get('/admin/ads/categories', {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function createAdminAdCategory(accessToken: string, payload: CreateAdCategoryPayload) {
  return getApiData<AdCategory>(
    await apiClient.post('/admin/ads/categories', payload, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function updateAdminAdCategory(
  accessToken: string,
  categoryId: string,
  payload: UpdateAdCategoryPayload,
) {
  return getApiData<AdCategory>(
    await apiClient.put(`/admin/ads/categories/${categoryId}`, payload, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function deleteAdminAdCategory(accessToken: string, categoryId: string) {
  return getApiData<{ id: string; deleted: boolean }>(
    await apiClient.delete(`/admin/ads/categories/${categoryId}`, {
      headers: authHeaders(accessToken),
    }),
  );
}
