import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');
const ADMIN_SESSION_STORAGE_KEY = 'play-admin-session';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.request.use((config) => {
  const session = getStoredAdminSession();
  const hasAuthHeader = Boolean(config.headers?.Authorization);

  if (hasAuthHeader && session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      throw error;
    }

    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const errorCode = (error.response?.data as { error?: { code?: string } } | undefined)?.error?.code;

    if (import.meta.env.DEV) {
      console.log('Admin API error:', {
        method: originalRequest?.method,
        url: originalRequest?.url,
        baseURL: originalRequest?.baseURL,
        status: error.response?.status,
        code: errorCode,
        message: error.message,
      });
    }

    const isTokenError = errorCode === 'ACCESS_TOKEN_INVALID' || errorCode === 'SESSION_REVOKED' || errorCode === 'ACCESS_TOKEN_REQUIRED';

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      !isTokenError ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      throw error;
    }

    originalRequest._retry = true;
    const nextAccessToken = await refreshStoredAdminSession();

    if (!nextAccessToken) {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      window.dispatchEvent(new Event('play-admin-session-expired'));
      throw error;
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
    return apiClient(originalRequest);
  },
);

export function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function getApiData<T>(response: { data?: { data?: T } }): T {
  const data = response.data?.data;

  if (data === undefined) {
    throw new Error('Invalid API response.');
  }

  return data;
}

export function handleApiError(error: unknown, defaultMessage = 'Request failed.') {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | {
          message?: string;
          error?: {
            message?: string;
            fieldErrors?: { message?: string }[];
          };
        }
      | undefined;

    return (
      payload?.error?.fieldErrors?.[0]?.message ||
      payload?.error?.message ||
      payload?.message ||
      error.message ||
      defaultMessage
    );
  }

  return error instanceof Error ? error.message : defaultMessage;
}

function getStoredAdminSession(): { accessToken?: string; refreshToken?: string; user?: unknown } | null {
  const raw = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as { accessToken?: string; refreshToken?: string; user?: unknown };
  } catch {
    return null;
  }
}

async function refreshStoredAdminSession() {
  if (!refreshPromise) {
    refreshPromise = refreshStoredAdminSessionOnce().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function refreshStoredAdminSessionOnce() {
  const session = getStoredAdminSession();
  if (!session?.refreshToken) return null;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: session.refreshToken },
      { timeout: 60000 },
    );
    const data = getApiData<{
      user: unknown;
      tokens: {
        accessToken: string;
        refreshToken: string;
      };
    }>(response);

    localStorage.setItem(
      ADMIN_SESSION_STORAGE_KEY,
      JSON.stringify({
        user: data.user,
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      }),
    );

    window.dispatchEvent(new Event('play-admin-session-refreshed'));
    return data.tokens.accessToken;
  } catch {
    return null;
  }
}
