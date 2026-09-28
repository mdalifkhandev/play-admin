import { apiClient, authHeaders, getApiData } from './client';

export type AdminLiveStreamStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export type AdminLiveStream = {
  id: string;
  hostId: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  title: string;
  description?: string;
  coverImage?: string;
  status: AdminLiveStreamStatus;
  viewerCount: number;
  peakViewerCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  giftsCount: number;
  category?: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  recording?: {
    status: string;
    mode?: 'mix' | 'individual';
    startedAt?: string;
    stoppedAt?: string;
    fileList?: unknown;
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
    playbackUrls?: string[];
    errorMessage?: string;
  };
  createdAt: string;
};

export type AdminReportedLiveStream = {
  reportId: string;
  reason: string;
  reportedAt: string;
  reporter?: {
    id?: string;
    email?: string;
    displayName?: string;
    username?: string;
    photoUrl?: string;
  };
  stream?: AdminLiveStream;
};

export type AdminLiveStreamListResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminLiveStreamToken = {
  appId: string;
  token: string;
  channelName: string;
  uid: number;
  hostUid: number;
  role: 'host' | 'viewer';
  expiresInSeconds: number;
};

export async function listAdminLiveStreams(
  accessToken: string,
  params: { status?: AdminLiveStreamStatus; reported?: boolean; page?: number; limit?: number },
) {
  return getApiData<AdminLiveStreamListResponse<AdminLiveStream | AdminReportedLiveStream>>(
    await apiClient.get('/admin/live-streams', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function listAdminRecordedLiveStreams(
  accessToken: string,
  params: { page?: number; limit?: number },
) {
  return getApiData<AdminLiveStreamListResponse<AdminLiveStream>>(
    await apiClient.get('/admin/live-streams/recorded', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function forceEndAdminLiveStream(accessToken: string, streamId: string) {
  return getApiData<AdminLiveStream>(
    await apiClient.post(
      `/admin/live-streams/${encodeURIComponent(streamId)}/force-end`,
      {},
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function getAdminLiveStreamToken(accessToken: string, streamId: string) {
  return getApiData<AdminLiveStreamToken>(
    await apiClient.post(
      `/live-streams/${encodeURIComponent(streamId)}/token`,
      {},
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function dismissAdminLiveStreamReport(accessToken: string, reportId: string) {
  return getApiData<{ id: string; status: string; action: string }>(
    await apiClient.patch(
      `/admin/moderation/reports/${encodeURIComponent(reportId)}/review`,
      { action: 'keep', reason: 'Dismissed from Live Management.' },
      { headers: authHeaders(accessToken) },
    ),
  );
}
