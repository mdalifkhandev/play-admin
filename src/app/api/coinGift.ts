import { apiClient, authHeaders, getApiData } from './client';

export type AdminCoinPackage = {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  stripePriceId?: string;
};

export type AdminGift = {
  id: string;
  name: string;
  code: string;
  icon: string;
  coinPrice: number;
  isActive: boolean;
  sortOrder: number;
};

export type AdminCoinSettings = {
  coinsPerDollar: number;
  minWithdrawalUsd: number;
  maxWithdrawalUsd: number;
  updatedAt?: string;
};

export type AdminCoinTransaction = {
  id: string;
  user: string;
  type: string;
  coins: number;
  amount: number;
  currency: string;
  status: string;
  paymentProvider: string;
  createdAt: string;
  completedAt?: string;
};

export type AdminCoinTransactionList = {
  items: AdminCoinTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function listAdminCoinPackages(accessToken: string) {
  return getApiData<AdminCoinPackage[]>(
    await apiClient.get('/coins/admin/packages', { headers: authHeaders(accessToken) }),
  );
}

export async function createAdminCoinPackage(accessToken: string, input: Partial<AdminCoinPackage>) {
  return getApiData<AdminCoinPackage>(
    await apiClient.post('/coins/admin/packages', input, { headers: authHeaders(accessToken) }),
  );
}

export async function updateAdminCoinPackage(
  accessToken: string,
  packageId: string,
  input: Partial<AdminCoinPackage>,
) {
  return getApiData<AdminCoinPackage>(
    await apiClient.patch(`/coins/admin/packages/${packageId}`, input, { headers: authHeaders(accessToken) }),
  );
}

export async function deleteAdminCoinPackage(accessToken: string, packageId: string) {
  return getApiData<{ deleted: boolean; id: string }>(
    await apiClient.delete(`/coins/admin/packages/${packageId}`, { headers: authHeaders(accessToken) }),
  );
}

export async function listAdminGifts(accessToken: string) {
  return getApiData<AdminGift[]>(
    await apiClient.get('/coins/admin/gifts', { headers: authHeaders(accessToken) }),
  );
}

export async function createAdminGift(accessToken: string, input: Partial<AdminGift>) {
  return getApiData<AdminGift>(
    await apiClient.post('/coins/admin/gifts', input, { headers: authHeaders(accessToken) }),
  );
}

export async function updateAdminGift(accessToken: string, giftId: string, input: Partial<AdminGift>) {
  return getApiData<AdminGift>(
    await apiClient.patch(`/coins/admin/gifts/${giftId}`, input, { headers: authHeaders(accessToken) }),
  );
}

export async function deleteAdminGift(accessToken: string, giftId: string) {
  return getApiData<{ deleted: boolean; id: string }>(
    await apiClient.delete(`/coins/admin/gifts/${giftId}`, { headers: authHeaders(accessToken) }),
  );
}

export async function getAdminCoinSettings(accessToken: string) {
  return getApiData<AdminCoinSettings>(
    await apiClient.get('/coins/admin/settings', { headers: authHeaders(accessToken) }),
  );
}

export async function updateAdminCoinSettings(accessToken: string, input: AdminCoinSettings) {
  return getApiData<AdminCoinSettings>(
    await apiClient.put('/coins/admin/settings', input, { headers: authHeaders(accessToken) }),
  );
}

export async function listAdminCoinTransactions(accessToken: string, params: { page?: number; limit?: number }) {
  return getApiData<AdminCoinTransactionList>(
    await apiClient.get('/coins/admin/transactions', {
      headers: authHeaders(accessToken),
      params,
    }),
  );
}
