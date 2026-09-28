import { apiClient, authHeaders, getApiData } from './client';

export type AnnouncementAudience = 'all' | 'creators' | 'premium';
export type AnnouncementStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'paused';
export type AnnouncementPlacement =
  | 'home_banner'
  | 'notification_tab'
  | 'inbox_notice'
  | 'profile_notice'
  | 'live_notice'
  | 'login_notice'
  | 'maintenance';

export type AdminAnnouncement = {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  placement: AnnouncementPlacement;
  status: AnnouncementStatus;
  priority: number;
  startsAt?: string;
  endsAt?: string;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminAnnouncementList = {
  items: AdminAnnouncement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateAdminAnnouncementInput = {
  title: string;
  message: string;
  audience: AnnouncementAudience;
  placement?: AnnouncementPlacement;
  priority?: number;
  startsAt?: string;
  endsAt?: string;
  schedule?: boolean;
  scheduledFor?: string;
};

export type UpdateAdminAnnouncementInput = Omit<Partial<CreateAdminAnnouncementInput>, 'startsAt' | 'endsAt' | 'scheduledFor'> & {
  status?: AnnouncementStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  scheduledFor?: string | null;
};

export async function listAdminAnnouncements(
  accessToken: string,
  params: { page?: number; limit?: number; status?: AnnouncementStatus },
) {
  return getApiData<AdminAnnouncementList>(
    await apiClient.get('/admin/announcements', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function createAdminAnnouncement(accessToken: string, input: CreateAdminAnnouncementInput) {
  return getApiData<AdminAnnouncement>(
    await apiClient.post('/admin/announcements', input, { headers: authHeaders(accessToken) }),
  );
}

export async function updateAdminAnnouncement(
  accessToken: string,
  announcementId: string,
  input: UpdateAdminAnnouncementInput,
) {
  return getApiData<AdminAnnouncement>(
    await apiClient.patch(`/admin/announcements/${announcementId}`, input, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function deleteAdminAnnouncement(accessToken: string, announcementId: string) {
  return getApiData<{ deleted: boolean; id: string }>(
    await apiClient.delete(`/admin/announcements/${announcementId}`, { headers: authHeaders(accessToken) }),
  );
}
