import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  activateAdminUser,
  banAdminUser,
  listAdminUsers,
  suspendAdminUser,
  verifyAdminUser,
  warnAdminUser,
  type AdminManagedUser,
  type AdminUserListParams,
} from './adminUsers';

export const adminUsersQueryKeys = {
  all: ['admin-users'] as const,
  list: (params: AdminUserListParams) => [...adminUsersQueryKeys.all, 'list', params] as const,
};

export function useAdminUsersQuery(accessToken: string, params: AdminUserListParams) {
  return useQuery({
    queryKey: adminUsersQueryKeys.list(params),
    queryFn: () => listAdminUsers(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 15_000,
  });
}

export function useBanAdminUserMutation(accessToken: string) {
  return useUserActionMutation((userId) => banAdminUser(accessToken, userId));
}

export function useSuspendAdminUserMutation(accessToken: string) {
  return useUserActionMutation((userId) => suspendAdminUser(accessToken, userId));
}

export function useVerifyAdminUserMutation(accessToken: string) {
  return useUserActionMutation((userId) => verifyAdminUser(accessToken, userId));
}

export function useActivateAdminUserMutation(accessToken: string) {
  return useUserActionMutation((userId) => activateAdminUser(accessToken, userId));
}

export function useWarnAdminUserMutation(accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => warnAdminUser(accessToken, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all });
    },
  });
}

function useUserActionMutation(action: (userId: string) => Promise<AdminManagedUser>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all });
    },
  });
}
