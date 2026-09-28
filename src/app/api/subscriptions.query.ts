import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminSubscriptionPlan,
  deleteAdminSubscriptionPlan,
  listAdminSubscriptionPlans,
  listAdminSubscriptionSubscribers,
  updateAdminSubscriptionSubscriberStatus,
  updateAdminSubscriptionPlan,
  type AdminSubscriptionSubscriberFilters,
  type AdminSubscriptionSubscriberStatus,
  type AdminSubscriptionPlanInput,
} from './subscriptions';
import { dashboardQueryKeys } from './dashboard.query';
import { monetizationQueryKeys } from './monetization.query';

export const subscriptionQueryKeys = {
  all: ['admin-subscriptions'] as const,
  plans: () => [...subscriptionQueryKeys.all, 'plans'] as const,
  subscribers: (filters: AdminSubscriptionSubscriberFilters) => [...subscriptionQueryKeys.all, 'subscribers', filters] as const,
};

export function useAdminSubscriptionPlansQuery(accessToken: string) {
  return useQuery({
    queryKey: subscriptionQueryKeys.plans(),
    queryFn: () => listAdminSubscriptionPlans(accessToken),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useAdminSubscriptionSubscribersQuery(
  accessToken: string,
  filters: AdminSubscriptionSubscriberFilters,
) {
  return useQuery({
    queryKey: subscriptionQueryKeys.subscribers(filters),
    queryFn: () => listAdminSubscriptionSubscribers(accessToken, filters),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useCreateAdminSubscriptionPlanMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminSubscriptionPlanInput) => createAdminSubscriptionPlan(accessToken, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateAdminSubscriptionPlanMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: AdminSubscriptionPlanInput }) =>
      updateAdminSubscriptionPlan(accessToken, planId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useDeleteAdminSubscriptionPlanMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => deleteAdminSubscriptionPlan(accessToken, planId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}

export function useUpdateAdminSubscriptionSubscriberStatusMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AdminSubscriptionSubscriberStatus }) =>
      updateAdminSubscriptionSubscriberStatus(accessToken, userId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: monetizationQueryKeys.all, refetchType: 'all' }),
      ]);
    },
  });
}
