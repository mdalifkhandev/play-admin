import { apiClient, authHeaders, getApiData } from './client';

export type AdminManagedUserStatus = 'Active' | 'Banned' | 'Suspended' | 'Pending';

export type AdminManagedUser = {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  status: AdminManagedUserStatus;
  followers: number;
  avatar: string;
  bio: string;
  videos: number;
  reports: number;
};

export type AdminUserListParams = {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export type AdminUserListResult = {
  items: AdminManagedUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function listAdminUsers(
  accessToken: string,
  params: AdminUserListParams,
): Promise<AdminUserListResult> {
  return getApiData<AdminUserListResult>(
    await apiClient.get('/admin/users', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function banAdminUser(accessToken: string, userId: string): Promise<AdminManagedUser> {
  const data = getApiData<{ user: AdminManagedUser }>(
    await apiClient.patch(`/admin/users/${userId}/ban`, {}, { headers: authHeaders(accessToken) }),
  );

  return data.user;
}

export async function suspendAdminUser(accessToken: string, userId: string): Promise<AdminManagedUser> {
  const data = getApiData<{ user: AdminManagedUser }>(
    await apiClient.patch(`/admin/users/${userId}/suspend`, {}, { headers: authHeaders(accessToken) }),
  );

  return data.user;
}

export async function verifyAdminUser(accessToken: string, userId: string): Promise<AdminManagedUser> {
  const data = getApiData<{ user: AdminManagedUser }>(
    await apiClient.patch(`/admin/users/${userId}/verify`, {}, { headers: authHeaders(accessToken) }),
  );

  return data.user;
}

export async function activateAdminUser(accessToken: string, userId: string): Promise<AdminManagedUser> {
  const data = getApiData<{ user: AdminManagedUser }>(
    await apiClient.patch(`/admin/users/${userId}/activate`, {}, { headers: authHeaders(accessToken) }),
  );

  return data.user;
}

export async function warnAdminUser(accessToken: string, userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/warnings`, {}, { headers: authHeaders(accessToken) });
}
