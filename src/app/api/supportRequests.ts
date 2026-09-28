import { apiClient, authHeaders, getApiData } from './client';

export type SupportCategory = 'account' | 'billing' | 'content' | 'safety' | 'technical' | 'other';
export type SupportRequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportPriority = 'low' | 'normal' | 'high' | 'urgent';

export type AdminSupportRequest = {
  id: string;
  ticketNumber: string;
  requesterUserId: string;
  category: SupportCategory;
  subject: string;
  status: SupportRequestStatus;
  priority: SupportPriority;
  assignedTo: string | null;
  messageCount: number;
  lastMessageAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSupportMessage = {
  id: string;
  senderUserId: string;
  senderType: 'user' | 'staff';
  message: string;
  createdAt: string;
};

export type AdminSupportRequestDetail = {
  request: AdminSupportRequest;
  messages: AdminSupportMessage[];
};

export type AdminSupportRequestList = {
  items: AdminSupportRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export async function listAdminSupportRequests(
  accessToken: string,
  params: { page?: number; limit?: number; status?: SupportRequestStatus },
) {
  return getApiData<AdminSupportRequestList>(
    await apiClient.get('/admin/support-requests', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function getAdminSupportRequest(accessToken: string, requestId: string) {
  return getApiData<AdminSupportRequestDetail>(
    await apiClient.get(`/admin/support-requests/${requestId}`, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function replyAdminSupportRequest(accessToken: string, requestId: string, message: string) {
  return getApiData<AdminSupportRequestDetail>(
    await apiClient.post(
      `/admin/support-requests/${requestId}/messages`,
      { message },
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function updateAdminSupportRequest(
  accessToken: string,
  requestId: string,
  input: { status?: SupportRequestStatus; priority?: SupportPriority; assignedTo?: string | null },
) {
  return getApiData<{ request: AdminSupportRequest }>(
    await apiClient.patch(`/admin/support-requests/${requestId}`, input, {
      headers: authHeaders(accessToken),
    }),
  );
}
