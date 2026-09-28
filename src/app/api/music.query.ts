import { useQuery } from '@tanstack/react-query';

import { searchAdminMusicTracks, type AdminMusicSearchParams } from './music';

export const musicQueryKeys = {
  all: ['admin-music'] as const,
  tracks: (params: AdminMusicSearchParams) => [...musicQueryKeys.all, 'tracks', params] as const,
};

export function useAdminMusicTracksQuery(params: AdminMusicSearchParams) {
  return useQuery({
    queryKey: musicQueryKeys.tracks(params),
    queryFn: () => searchAdminMusicTracks(params),
    staleTime: 30_000,
  });
}
