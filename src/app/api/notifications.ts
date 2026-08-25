import { apiClient, authHeaders, getApiData } from './client';

export type AdminNotification = {
  id: string;
  type: string;
  title?: string;
  body?: string;
  relatedEntityId?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
};

export type AdminNotificationAudience =
  | 'all'
  | 'specific_user'
  | 'creators'
  | 'premium'
  | 'kids'
  | 'active_users';

export type AdminNotificationTemplate = {
  id: string;
  title: string;
  body: string;
  notificationType: string;
  deepLink?: string;
};

export type AdminNotificationHistoryItem = AdminNotification & {
  recipient?: {
    id: string;
    email: string;
    name: string;
    photoUrl?: string;
  };
  actor?: {
    id: string;
    email: string;
    name: string;
    photoUrl?: string;
  };
};

export type AdminNotificationHistory = {
  items: AdminNotificationHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type RawNotification = {
  _id?: string;
  id?: string;
  type: string;
  title?: string;
  body?: string;
  relatedEntityId?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
};

export async function getAdminNotifications(
  accessToken: string,
  limit = 8,
  cursor?: string | null,
): Promise<{ items: AdminNotification[]; nextCursor: string | null }> {
  const data = getApiData<{ items: RawNotification[]; nextCursor: string | null }>(
    await apiClient.get('/notifications', {
      params: cursor ? { limit, cursor } : { limit },
      headers: authHeaders(accessToken),
    }),
  );

  return {
    items: data.items.map((item) => ({
      id: item.id || item._id || '',
      type: item.type,
      title: item.title,
      body: item.body,
      relatedEntityId: item.relatedEntityId,
      data: item.data,
      isRead: item.isRead,
      createdAt: item.createdAt,
    })),
    nextCursor: data.nextCursor,
  };
}

export async function markAdminNotificationsAsRead(
  accessToken: string,
  notificationIds?: string[],
): Promise<{ modifiedCount: number }> {
  return getApiData<{ modifiedCount: number }>(
    await apiClient.patch(
      '/notifications/read',
      notificationIds ? { notificationIds } : {},
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function sendAdminNotification(
  accessToken: string,
  input: {
    title: string;
    body: string;
    audience: AdminNotificationAudience;
    userId?: string;
    notificationType?: string;
    deepLink?: string;
    schedule?: boolean;
    scheduledFor?: string;
  },
) {
  return getApiData<{
    targetedUserCount: number;
    targetedDeviceCount: number;
    successCount: number;
    failureCount: number;
    invalidTokenCount: number;
  }>(
    await apiClient.post('/notifications/admin/send', input, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function getAdminNotificationHistory(
  accessToken: string,
  params: { page?: number; limit?: number },
) {
  return getApiData<AdminNotificationHistory>(
    await apiClient.get('/notifications/admin/history', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function getAdminNotificationTemplates(accessToken: string) {
  return getApiData<AdminNotificationTemplate[]>(
    await apiClient.get('/notifications/admin/templates', {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function updateAdminNotification(
  accessToken: string,
  notificationId: string,
  input: {
    title?: string;
    body?: string;
    notificationType?: string;
    deepLink?: string | null;
  },
) {
  return getApiData<AdminNotificationHistoryItem>(
    await apiClient.patch(`/notifications/admin/${notificationId}`, input, {
      headers: authHeaders(accessToken),
    }),
  );
}
