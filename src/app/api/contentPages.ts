import { apiClient, authHeaders, getApiData } from './client';

export type ContentPageType = 'about-us' | 'privacy-policy' | 'terms-conditions';
export type ContentPageStatus = 'draft' | 'published' | 'archived';

export type ContentSection = {
  heading: string;
  content: string;
  order: number;
};

export type AdminContentPage = {
  id: string;
  pageType: ContentPageType;
  title: string;
  sections: ContentSection[];
  version: number;
  status: ContentPageStatus;
  changeSummary?: string;
  effectiveAt?: string;
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminContentPageList = {
  items: AdminContentPage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SaveAdminContentPageInput = {
  pageType: ContentPageType;
  title: string;
  sections: ContentSection[];
  changeSummary?: string;
  effectiveAt?: string;
};

export type UpdateAdminContentPageInput = Omit<Partial<SaveAdminContentPageInput>, 'pageType'>;

export async function listAdminContentPages(
  accessToken: string,
  params: { pageType?: ContentPageType; status?: ContentPageStatus; page?: number; limit?: number },
) {
  return getApiData<AdminContentPageList>(
    await apiClient.get('/admin/content-pages', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function createAdminContentPage(accessToken: string, input: SaveAdminContentPageInput) {
  return getApiData<{ page: AdminContentPage }>(
    await apiClient.post('/admin/content-pages', input, { headers: authHeaders(accessToken) }),
  );
}

export async function updateAdminContentPage(
  accessToken: string,
  pageId: string,
  input: UpdateAdminContentPageInput,
) {
  return getApiData<{ page: AdminContentPage }>(
    await apiClient.patch(`/admin/content-pages/${pageId}`, input, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function publishAdminContentPage(accessToken: string, pageId: string, effectiveAt?: string) {
  return getApiData<{ page: AdminContentPage }>(
    await apiClient.post(
      `/admin/content-pages/${pageId}/publish`,
      effectiveAt ? { effectiveAt } : {},
      { headers: authHeaders(accessToken) },
    ),
  );
}
