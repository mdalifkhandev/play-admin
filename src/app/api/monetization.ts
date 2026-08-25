import { apiClient, authHeaders, getApiData } from './client';

export type MonetizationDashboard = {
  summary: {
    totalRevenue: number;
    adRevenue: number;
    coinRevenue: number;
    subscriptionRevenue: number;
    pendingPayouts: number;
    completedPayouts: number;
  };
  revenueBreakdown: { name: string; value: number; amount: number }[];
  creatorEarnings: {
    id: string;
    name: string;
    total: number;
    thisMonth: number;
    payout: string;
  }[];
  settings: {
    creatorSharePercent: number;
    adminSharePercent: number;
  };
  creatorRequirements: CreatorRequirementSettings;
  revenueTrend: { month: string; revenue: number }[];
};

export type CreatorRequirementSettings = {
  profileEnabled: boolean;
  followersEnabled: boolean;
  followers: number;
  viewsEnabled: boolean;
  views: number;
  watchTimeEnabled: boolean;
  watchTimeMinutes: number;
  likesEnabled: boolean;
  likes: number;
  accountAgeEnabled: boolean;
  accountAgeDays: number;
  reelsEnabled: boolean;
  reels: number;
  guidelinesEnabled: boolean;
  reportLimit: number;
};

export async function getMonetizationDashboard(accessToken: string) {
  return getApiData<MonetizationDashboard>(
    await apiClient.get('/admin/monetization/dashboard', {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function updateMonetizationSettings(accessToken: string, creatorSharePercent: number) {
  return getApiData<MonetizationDashboard['settings']>(
    await apiClient.put(
      '/admin/monetization/settings',
      { creatorSharePercent },
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function updateCreatorRequirementSettings(
  accessToken: string,
  settings: CreatorRequirementSettings,
) {
  return getApiData<CreatorRequirementSettings>(
    await apiClient.put(
      '/admin/monetization/creator-requirements',
      settings,
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function releasePendingCreatorEarnings(accessToken: string) {
  return getApiData<{ released: number }>(
    await apiClient.post(
      '/admin/monetization/earnings/release',
      {},
      { headers: authHeaders(accessToken) },
    ),
  );
}
