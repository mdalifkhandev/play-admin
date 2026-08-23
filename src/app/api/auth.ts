const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  profile?: {
    displayName?: string;
    username?: string;
    photoUrl?: string;
  };
};

export type AdminSession = {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
};

type AuthResponse = {
  user: AdminUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    message?: string;
  };
};

export async function loginAdmin(email: string, password: string): Promise<AdminSession> {
  const data = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe: true }),
  });

  assertAdmin(data.user);

  return {
    user: data.user,
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  };
}

export async function getAdminMe(accessToken: string): Promise<AdminUser> {
  const data = await request<{ user: AdminUser }>('/auth/me', {
    headers: authHeaders(accessToken),
  });

  assertAdmin(data.user);
  return data.user;
}

export async function refreshAdminSession(refreshToken: string): Promise<AdminSession> {
  const data = await request<AuthResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  assertAdmin(data.user);

  return {
    user: data.user,
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  };
}

export async function logoutAdmin(refreshToken?: string, accessToken?: string): Promise<void> {
  await request<{ loggedOut: boolean }>('/auth/logout', {
    method: 'POST',
    headers: accessToken ? authHeaders(accessToken) : undefined,
    body: JSON.stringify({ refreshToken }),
  }).catch(() => undefined);
}

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
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

function assertAdmin(user: AdminUser) {
  if (user.role !== 'admin') {
    throw new Error('Only admin accounts can access this dashboard.');
  }
}
