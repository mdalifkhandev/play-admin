import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api/v1').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
