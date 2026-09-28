import { apiClient, authHeaders, getApiData } from './client';

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  profile?: {
    displayName?: string;
    username?: string;
    bio?: string;
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

export async function loginAdmin(email: string, password: string): Promise<AdminSession> {
  const data = getApiData<AuthResponse>(
    await apiClient.post('/auth/admin-login', { email, password, rememberMe: true }),
  );

  assertAdmin(data.user);

  return {
    user: data.user,
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  };
}

export async function getAdminMe(accessToken: string): Promise<AdminUser> {
  const data = getApiData<{ user: AdminUser }>(
    await apiClient.get('/auth/me', { headers: authHeaders(accessToken) }),
  );

  assertAdmin(data.user);
  return data.user;
}

export async function updateAdminProfile(
  accessToken: string,
  profile: {
    displayName?: string;
    username?: string;
    bio?: string;
    photoUrl?: string;
  },
): Promise<AdminUser> {
  const data = getApiData<{ user: AdminUser }>(
    await apiClient.patch('/auth/profile', profile, { headers: authHeaders(accessToken) }),
  );

  assertAdmin(data.user);
  return data.user;
}

export async function updateAdminProfileWithPhoto(
  accessToken: string,
  profile: {
    displayName?: string;
    username?: string;
    bio?: string;
    photo?: File;
  },
): Promise<AdminUser> {
  const formData = new FormData();

  if (profile.username !== undefined) formData.append('username', profile.username);
  if (profile.displayName !== undefined) formData.append('displayName', profile.displayName);
  if (profile.bio !== undefined) formData.append('bio', profile.bio);
  if (profile.photo) formData.append('photo', profile.photo);

  const data = getApiData<{ user: AdminUser }>(
    await apiClient.patch('/auth/setup-profile', formData, {
      headers: {
        ...authHeaders(accessToken),
        'Content-Type': 'multipart/form-data',
      },
    }),
  );

  assertAdmin(data.user);
  return data.user;
}

export async function refreshAdminSession(refreshToken: string): Promise<AdminSession> {
  const data = getApiData<AuthResponse>(
    await apiClient.post('/auth/refresh', { refreshToken }),
  );

  assertAdmin(data.user);

  return {
    user: data.user,
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  };
}

export async function logoutAdmin(refreshToken?: string, accessToken?: string): Promise<void> {
  await apiClient
    .post('/auth/logout', { refreshToken }, { headers: accessToken ? authHeaders(accessToken) : undefined })
    .catch(() => undefined);
}

function assertAdmin(user: AdminUser) {
  const allowedRoles = ['admin', 'moderator', 'support', 'finance'];
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Only admin accounts can access this dashboard.');
  }
}
