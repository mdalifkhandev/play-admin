import { apiClient, authHeaders, getApiData } from "./client";

export type AdminContentType = "reels" | "comments" | "users" | "profiles" | "live-streams";

export type AdminContentItem = {
  id: string;
  type: string;
  title: string;
  description?: string;
  status: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  owner?: {
    id: string;
    email?: string;
    displayName?: string;
    username?: string;
    photoUrl?: string;
  };
  stats?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
};

export type AdminContentList = {
  items: AdminContentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UpdateAdminContentInput = {
  title?: string;
  description?: string | null;
  status?: string;
};

export async function listAdminContent(
  accessToken: string,
  params: { type: AdminContentType; q?: string; status?: string; page?: number; limit?: number },
) {
  return getApiData<AdminContentList>(
    await apiClient.get("/admin/content", {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function updateAdminContent(
  accessToken: string,
  type: AdminContentType,
  id: string,
  input: UpdateAdminContentInput,
) {
  return getApiData<AdminContentItem>(
    await apiClient.patch(`/admin/content/${type}/${encodeURIComponent(id)}`, input, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function removeAdminContent(accessToken: string, type: AdminContentType, id: string) {
  return getApiData<AdminContentItem>(
    await apiClient.post(`/admin/content/${type}/${encodeURIComponent(id)}/remove`, {}, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function restoreAdminContent(accessToken: string, type: AdminContentType, id: string) {
  return getApiData<AdminContentItem>(
    await apiClient.post(`/admin/content/${type}/${encodeURIComponent(id)}/restore`, {}, {
      headers: authHeaders(accessToken),
    }),
  );
}

