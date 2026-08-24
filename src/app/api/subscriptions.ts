import { apiClient, authHeaders, getApiData } from './client';

export type AdminSubscriptionPlan = {
  id: string;
  name: string;
  interval: 'month' | 'year' | 'lifetime';
  price: number;
  currency: 'usd';
  discountLabel?: string;
  productIdentifier?: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
};

export type AdminSubscriptionPlanInput = {
  planId?: string;
  name: string;
  interval: 'month' | 'year' | 'lifetime';
  price: number;
  currency: 'usd';
  discountLabel?: string;
  productIdentifier?: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
};

export type AdminSubscriptionSubscriber = {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  plan?: string;
  status: 'none' | 'active' | 'expired' | 'canceled' | 'hold';
  expiresAt?: string;
  provider?: 'revenuecat' | 'apple_pay' | 'stripe';
  paymentId?: string;
  isPremium: boolean;
  updatedAt?: string;
};

export type AdminSubscriptionSubscribersResponse = {
  items: AdminSubscriptionSubscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminSubscriptionSubscriberFilters = {
  page?: number;
  limit?: number;
  status?: string;
  planId?: string;
};

export type AdminSubscriptionSubscriberStatus = 'active' | 'hold' | 'canceled';

export async function listAdminSubscriptionPlans(accessToken: string) {
  return getApiData<AdminSubscriptionPlan[]>(
    await apiClient.get('/subscriptions/admin/plans', {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function listAdminSubscriptionSubscribers(
  accessToken: string,
  filters: AdminSubscriptionSubscriberFilters,
) {
  return getApiData<AdminSubscriptionSubscribersResponse>(
    await apiClient.get('/subscriptions/admin/subscribers', {
      headers: authHeaders(accessToken),
      params: filters,
    }),
  );
}

export async function updateAdminSubscriptionSubscriberStatus(
  accessToken: string,
  userId: string,
  status: AdminSubscriptionSubscriberStatus,
) {
  return getApiData<AdminSubscriptionSubscriber>(
    await apiClient.patch(
      `/subscriptions/admin/subscribers/${encodeURIComponent(userId)}/status`,
      { status },
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function createAdminSubscriptionPlan(accessToken: string, input: AdminSubscriptionPlanInput) {
  return getApiData<AdminSubscriptionPlan>(
    await apiClient.post(
      '/subscriptions/admin/plans',
      { ...input, planId: input.planId },
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function updateAdminSubscriptionPlan(
  accessToken: string,
  planId: string,
  input: AdminSubscriptionPlanInput,
) {
  return getApiData<AdminSubscriptionPlan>(
    await apiClient.put(
      `/subscriptions/admin/plans/${encodeURIComponent(planId)}`,
      input,
      { headers: authHeaders(accessToken) },
    ),
  );
}

export async function deleteAdminSubscriptionPlan(accessToken: string, planId: string) {
  return getApiData<{ id: string }>(
    await apiClient.delete(`/subscriptions/admin/plans/${encodeURIComponent(planId)}`, {
      headers: authHeaders(accessToken),
    }),
  );
}
