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
