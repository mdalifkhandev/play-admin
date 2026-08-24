import { apiClient, authHeaders, getApiData } from './client';

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'transferred' | 'failed' | 'all';

export type AdminWithdrawalUser = {
  _id?: string;
  id?: string;
  email?: string;
  coinBalance?: number;
  stripeConnectAccountId?: string;
  stripeConnectOnboardingComplete?: boolean;
  profile?: {
    displayName?: string;
    username?: string;
    photoUrl?: string;
  };
};

export type AdminWithdrawal = {
  id: string;
  user: AdminWithdrawalUser | string;
  coins: number;
  coinsPerDollar: number;
  amountUsd: number;
  currency: string;
  status: Exclude<WithdrawalStatus, 'all'>;
  stripeConnectAccountId: string;
  stripeTransferId?: string;
  adminNotes?: string;
  createdAt: string;
  processedAt?: string;
};

export type AdminWithdrawalListParams = {
  status: WithdrawalStatus;
  page: number;
  limit: number;
};

export type AdminWithdrawalListResponse = {
  items: AdminWithdrawal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function listAdminWithdrawals(
  accessToken: string,
  params: AdminWithdrawalListParams,
) {
  return getApiData<AdminWithdrawalListResponse>(
    await apiClient.get('/coins/admin/withdrawals', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}

export async function approveAdminWithdrawal(
  accessToken: string,
  requestId: string,
  adminNotes?: string,
) {
  return getApiData<{ approved: true; withdrawalId: string; status: string }>(
    await apiClient.post(
      `/coins/admin/withdrawals/${requestId}/approve`,
      { adminNotes },
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function rejectAdminWithdrawal(
  accessToken: string,
  requestId: string,
  reason: string,
) {
  return getApiData<{ rejected: true; withdrawalId: string; status: string }>(
    await apiClient.post(
      `/coins/admin/withdrawals/${requestId}/reject`,
      { reason },
      { headers: authHeaders(accessToken) },
    ),
  );
}
