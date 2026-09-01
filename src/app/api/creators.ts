import { apiClient, authHeaders, getApiData } from './client';

export type CreatorApplicationStatus = 'pending' | 'approved' | 'rejected' | 'held';

export type CreatorApplication = {
  id: string;
  status: CreatorApplicationStatus;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  occupation?: string;
  contentCategory: string;
  contentLanguage: string;
  country: string;
  reason: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  adminReason?: string;
  reviewedAt?: string;
  createdAt: string;
  user: {
    id: string;
    email?: string;
    role?: string;
    profile?: {
      username?: string;
      displayName?: string;
      photoUrl?: string;
      bio?: string;
    };
  };
};

export type CreatorAnalyticsRange = '7d' | '28d' | '60d' | '90d';

export type CreatorAnalytics = {
  range: CreatorAnalyticsRange;
  summary: {
    reels: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    followers: number;
    newFollowers: number;
    engagementRate: number;
    earningsUsd: number;
    pendingEarningsUsd: number;
    availableEarningsUsd: number;
  };
  trend: Array<{ date: string; views: number; likes: number; comments: number; shares: number; saves: number }>;
  topReels: Array<{
    id: string;
    title: string;
    thumbnailUrl?: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    publishedAt: string | null;
  }>;
};

export async function listCreatorApplications(
  accessToken: string,
  status?: CreatorApplicationStatus,
  limit = 100,
): Promise<{ items: CreatorApplication[] }> {
  return getApiData<{ items: CreatorApplication[] }>(
    await apiClient.get('/admin/creators/applications', {
      headers: authHeaders(accessToken),
      params: {
        ...(status ? { status } : {}),
        limit,
      },
    }),
  );
}

export async function approveCreatorApplication(
  accessToken: string,
  applicationId: string,
): Promise<{ id: string; status: CreatorApplicationStatus }> {
  return getApiData<{ id: string; status: CreatorApplicationStatus }>(
    await apiClient.patch(`/admin/creators/applications/${applicationId}/approve`, {}, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function rejectCreatorApplication(
  accessToken: string,
  applicationId: string,
  reason?: string,
): Promise<{ id: string; status: CreatorApplicationStatus }> {
  return getApiData<{ id: string; status: CreatorApplicationStatus }>(
    await apiClient.patch(`/admin/creators/applications/${applicationId}/reject`, { reason }, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function holdCreatorApplication(
  accessToken: string,
  applicationId: string,
  reason?: string,
): Promise<{ id: string; status: CreatorApplicationStatus }> {
  return getApiData<{ id: string; status: CreatorApplicationStatus }>(
    await apiClient.patch(`/admin/creators/applications/${applicationId}/hold`, { reason }, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function getAdminCreatorAnalytics(
  accessToken: string,
  userId: string,
  range: CreatorAnalyticsRange = '28d',
): Promise<CreatorAnalytics> {
  return getApiData<CreatorAnalytics>(
    await apiClient.get(`/admin/creators/${userId}/analytics`, {
      headers: authHeaders(accessToken),
      params: { range },
    }),
  );
}
