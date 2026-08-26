import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAdminContent,
  removeAdminContent,
  restoreAdminContent,
  updateAdminContent,
  type AdminContentType,
  type UpdateAdminContentInput,
} from "./content";
import { dashboardQueryKeys } from "./dashboard.query";
import { moderationQueryKeys } from "./moderation.query";

const contentKeys = {
  all: ["admin-content"] as const,
  list: (params: { type: AdminContentType; q?: string; status?: string; page?: number; limit?: number }) =>
    [...contentKeys.all, params] as const,
};

export function useAdminContentQuery(
  accessToken: string,
  params: { type: AdminContentType; q?: string; status?: string; page?: number; limit?: number },
) {
  return useQuery({
    queryKey: contentKeys.list(params),
    queryFn: () => listAdminContent(accessToken, params),
    enabled: Boolean(accessToken),
  });
}

export function useUpdateAdminContentMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id, input }: { type: AdminContentType; id: string; input: UpdateAdminContentInput }) =>
      updateAdminContent(accessToken, type, id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contentKeys.all, refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: moderationQueryKeys.all, refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: "all" }),
      ]);
    },
  });
}

export function useRemoveAdminContentMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: AdminContentType; id: string }) => removeAdminContent(accessToken, type, id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contentKeys.all, refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: moderationQueryKeys.all, refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: "all" }),
      ]);
    },
  });
}

export function useRestoreAdminContentMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: AdminContentType; id: string }) => restoreAdminContent(accessToken, type, id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contentKeys.all, refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: moderationQueryKeys.all, refetchType: "all" }),
        queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all, refetchType: "all" }),
      ]);
    },
  });
}
