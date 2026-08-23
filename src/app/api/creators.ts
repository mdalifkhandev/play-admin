import { apiClient, authHeaders, getApiData } from './client';

export type CreatorApplicationStatus = 'pending' | 'approved' | 'rejected' | 'held';

export type CreatorApplication = {
  id: string;
  status: CreatorApplicationStatus;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  occupation?: string;
  contentCategory: string;
  contentLanguage: string;
  country: string;
  reason: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  adminReason?: string;
  reviewedAt?: string;
  createdAt: string;
  user: {
    id: string;
    email?: string;
    role?: string;
    profile?: {
      username?: string;
      displayName?: string;
      photoUrl?: string;
      bio?: string;
    };
  };
};

export async function listCreatorApplications(
  accessToken: string,
  status?: CreatorApplicationStatus,
  limit = 100,
): Promise<{ items: CreatorApplication[] }> {
  return getApiData<{ items: CreatorApplication[] }>(
    await apiClient.get('/admin/creators/applications', {
      headers: authHeaders(accessToken),
      params: {
        ...(status ? { status } : {}),
        limit,
      },
    }),
  );
}

export async function approveCreatorApplication(
  accessToken: string,
  applicationId: string,
): Promise<{ id: string; status: CreatorApplicationStatus }> {
  return getApiData<{ id: string; status: CreatorApplicationStatus }>(
    await apiClient.patch(`/admin/creators/applications/${applicationId}/approve`, {}, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function rejectCreatorApplication(
  accessToken: string,
  applicationId: string,
  reason?: string,
): Promise<{ id: string; status: CreatorApplicationStatus }> {
  return getApiData<{ id: string; status: CreatorApplicationStatus }>(
    await apiClient.patch(`/admin/creators/applications/${applicationId}/reject`, { reason }, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function holdCreatorApplication(
  accessToken: string,
  applicationId: string,
  reason?: string,
): Promise<{ id: string; status: CreatorApplicationStatus }> {
  return getApiData<{ id: string; status: CreatorApplicationStatus }>(
    await apiClient.patch(`/admin/creators/applications/${applicationId}/hold`, { reason }, {
      headers: authHeaders(accessToken),
    }),
  );
}
