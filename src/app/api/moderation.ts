import { apiClient, authHeaders, getApiData } from './client';

export type ModerationTargetType = 'reel' | 'comment' | 'user' | 'profile';
export type ModerationReportStatus = 'pending' | 'resolved' | 'rejected';
export type ModerationAction = 'keep' | 'remove' | 'warn' | 'suspend' | 'ban';

export type ModerationReport = {
  id: string;
  targetType: ModerationTargetType;
  targetId: string;
  reason: string;
  details?: string;
  status: ModerationReportStatus;
  action: string;
  reportCount: number;
  createdAt: string;
  reporter?: { id: string; email?: string; displayName?: string; photoUrl?: string };
  owner?: { id: string; email?: string; displayName?: string; photoUrl?: string };
  content?: {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    mediaUrl?: string;
  };
};

export type ModerationReportsResult = {
  items: ModerationReport[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function listModerationReports(
  accessToken: string,
  params: { targetType?: ModerationTargetType; status?: ModerationReportStatus; page?: number; limit?: number },
) {
  return getApiData<ModerationReportsResult>(
    await apiClient.get('/admin/moderation/reports', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function reviewModerationReport(
  accessToken: string,
  reportId: string,
  action: ModerationAction,
  reason?: string,
) {
  return getApiData<{ id: string; status: ModerationReportStatus; action: string }>(
    await apiClient.patch(
      `/admin/moderation/reports/${reportId}/review`,
      { action, reason },
      { headers: authHeaders(accessToken) },
    ),
  );
}
