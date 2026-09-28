import { useQuery } from '@tanstack/react-query';

import { listAdminAuditLogs, type AdminAuditListParams } from './adminAudit';

export const adminAuditQueryKeys = {
  all: ['admin-audit'] as const,
  list: (params: AdminAuditListParams) => [...adminAuditQueryKeys.all, 'list', params] as const,
};

export function useAdminAuditLogsQuery(accessToken: string, params: AdminAuditListParams) {
  return useQuery({
    queryKey: adminAuditQueryKeys.list(params),
    queryFn: () => listAdminAuditLogs(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}
