import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createAdminContentPage,
  listAdminContentPages,
  publishAdminContentPage,
  updateAdminContentPage,
  type ContentPageStatus,
  type ContentPageType,
  type SaveAdminContentPageInput,
  type UpdateAdminContentPageInput,
} from './contentPages';

export const contentPageQueryKeys = {
  all: ['admin-content-pages'] as const,
  list: (params: { pageType?: ContentPageType; status?: ContentPageStatus; page?: number; limit?: number }) =>
    [...contentPageQueryKeys.all, 'list', params] as const,
};

export function useAdminContentPagesQuery(
  accessToken: string,
  params: { pageType?: ContentPageType; status?: ContentPageStatus; page?: number; limit?: number },
) {
  return useQuery({
    queryKey: contentPageQueryKeys.list(params),
    queryFn: () => listAdminContentPages(accessToken, params),
    enabled: Boolean(accessToken),
    staleTime: 10_000,
  });
}

export function useCreateAdminContentPageMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveAdminContentPageInput) => createAdminContentPage(accessToken, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contentPageQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function useUpdateAdminContentPageMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, input }: { pageId: string; input: UpdateAdminContentPageInput }) =>
      updateAdminContentPage(accessToken, pageId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contentPageQueryKeys.all, refetchType: 'all' });
    },
  });
}

export function usePublishAdminContentPageMutation(accessToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pageId, effectiveAt }: { pageId: string; effectiveAt?: string }) =>
      publishAdminContentPage(accessToken, pageId, effectiveAt),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contentPageQueryKeys.all, refetchType: 'all' });
    },
  });
}
