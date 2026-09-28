import { apiClient, authHeaders, getApiData } from './client';

export type AdminKidsModeContent = {
  id: string;
  thumbnailUrl: string;
  uploader: string;
  uploadDate: string;
  kidFriendly: boolean;
  reportCount: number;
};

export type AdminKidsModeReport = {
  id: string;
  thumbnailUrl: string;
  reporterCount: number;
  reason: string;
  dateReported: string;
};

export type AdminKidsModeStats = {
  totalKidsModeUsers: number;
  activeKidsProfiles: number;
  ageBreakdown: { range: string; users: number }[];
};

export type AdminKidsModeListResult<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function listAdminKidsModeContent(
  accessToken: string,
  params: { page?: number; limit?: number; kidFriendly?: 'all' | 'yes' | 'no' },
) {
  return getApiData<AdminKidsModeListResult<AdminKidsModeContent>>(
    await apiClient.get('/admin/kids-mode/contents', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function updateAdminKidsModeContent(accessToken: string, reelId: string, forKids: boolean) {
  return getApiData<AdminKidsModeContent>(
    await apiClient.patch(
      `/admin/kids-mode/contents/${encodeURIComponent(reelId)}`,
      { forKids },
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function listAdminKidsModeReports(accessToken: string, params: { page?: number; limit?: number }) {
  return getApiData<AdminKidsModeListResult<AdminKidsModeReport>>(
    await apiClient.get('/admin/kids-mode/reports', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function removeAdminKidsModeReport(accessToken: string, reelId: string) {
  return getApiData<{ id: string; kidFriendly: boolean }>(
    await apiClient.post(
      `/admin/kids-mode/reports/${encodeURIComponent(reelId)}/remove`,
      {},
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function dismissAdminKidsModeReport(accessToken: string, reelId: string) {
  return getApiData<{ id: string; dismissed: true }>(
    await apiClient.post(
      `/admin/kids-mode/reports/${encodeURIComponent(reelId)}/dismiss`,
      {},
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function getAdminKidsModeStats(accessToken: string) {
  return getApiData<AdminKidsModeStats>(
    await apiClient.get('/admin/kids-mode/stats', {
      headers: authHeaders(accessToken),
    }),
  );
}
