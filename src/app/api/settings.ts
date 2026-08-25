import { apiClient, authHeaders, getApiData } from './client';

export interface PlatformLanguage {
  code: string;
  name: string;
  active: boolean;
}

export interface PlatformPayoutRate {
  region: string;
  rateUsd: number;
}

export interface PlatformFeatureFlags {
  liveStreaming: boolean;
  ads: boolean;
  kidsMode: boolean;
  rewards: boolean;
  subscriptions: boolean;
  creatorApplications: boolean;
  coinPurchase: boolean;
  withdrawals: boolean;
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  videosBetweenAds: number;
  payoutPerThousandViewsUsd: number;
  payoutRates: PlatformPayoutRate[];
  languages: PlatformLanguage[];
  featureFlags: PlatformFeatureFlags;
  updatedAt: string;
}

export type UpdatePlatformSettingsInput = Partial<
  Omit<PlatformSettings, 'updatedAt'> & {
    featureFlags: Partial<PlatformFeatureFlags>;
  }
>;

export async function getAdminPlatformSettings(accessToken: string) {
  return getApiData<PlatformSettings>(
    await apiClient.get('/admin/settings', { headers: authHeaders(accessToken) }),
  );
}

export async function updateAdminPlatformSettings(accessToken: string, input: UpdatePlatformSettingsInput) {
  return getApiData<PlatformSettings>(
    await apiClient.patch('/admin/settings', input, { headers: authHeaders(accessToken) }),
  );
}
