const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');

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

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    message?: string;
  };
};

export async function listAdminUsers(
  accessToken: string,
  params: AdminUserListParams,
): Promise<AdminUserListResult> {
  const search = new URLSearchParams();

  if (params.q) search.set('q', params.q);
  if (params.status) search.set('status', params.status);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));

  return request<AdminUserListResult>(`/admin/users?${search.toString()}`, {
    headers: authHeaders(accessToken),
  });
}

export async function banAdminUser(accessToken: string, userId: string): Promise<AdminManagedUser> {
  const data = await request<{ user: AdminManagedUser }>(`/admin/users/${userId}/ban`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({}),
  });

  return data.user;
}

export async function suspendAdminUser(accessToken: string, userId: string): Promise<AdminManagedUser> {
  const data = await request<{ user: AdminManagedUser }>(`/admin/users/${userId}/suspend`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({}),
  });

  return data.user;
}

export async function verifyAdminUser(accessToken: string, userId: string): Promise<AdminManagedUser> {
  const data = await request<{ user: AdminManagedUser }>(`/admin/users/${userId}/verify`, {
    method: 'PATCH',
    headers: authHeaders(accessToken),
    body: JSON.stringify({}),
  });

  return data.user;
}

export async function warnAdminUser(accessToken: string, userId: string): Promise<void> {
  await request<{ userId: string }>(`/admin/users/${userId}/warnings`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({}),
  });
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || payload?.message || 'Request failed.');
  }

  return payload.data;
}
