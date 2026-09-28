import { apiClient, authHeaders, getApiData } from './client';

export type AdminAuditLog = {
  id?: string;
  _id?: string;
  adminId?: {
    id?: string;
    _id?: string;
    email?: string;
    role?: string;
    profile?: {
      displayName?: string;
    };
  };
  action: string;
  resource: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
};

export type AdminAuditListParams = {
  page?: number;
  limit?: number;
  adminId?: string;
  resource?: string;
  action?: string;
};

export type AdminAuditListResult = {
  data: AdminAuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export async function listAdminAuditLogs(
  accessToken: string,
  params: AdminAuditListParams,
): Promise<AdminAuditListResult> {
  return getApiData<AdminAuditListResult>(
    await apiClient.get('/admin/audit-logs', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}
