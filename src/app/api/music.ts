import { apiClient, getApiData } from './client';

export type AdminMusicTrack = {
  provider: 'jamendo';
  providerTrackId: string;
  title: string;
  artistName: string;
  albumName: string | null;
  coverImageUrl: string | null;
  audioPreviewUrl: string;
  durationSeconds: number;
  shareUrl: string | null;
  licenseUrl: string | null;
  downloadAllowed: boolean;
  downloadUrl: string | null;
};

export type AdminMusicSearchResponse = {
  tracks: AdminMusicTrack[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
  };
};

export type AdminMusicSearchParams = {
  search?: string;
  page?: number;
  limit?: number;
  order?:
    | 'popularity_total'
    | 'popularity_month'
    | 'popularity_week'
    | 'releasedate'
    | 'name'
    | 'duration'
    | 'artist_name'
    | 'album_name';
};

export async function searchAdminMusicTracks(params: AdminMusicSearchParams = {}) {
  return getApiData<AdminMusicSearchResponse>(
    await apiClient.get('/music/tracks', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        order: params.order ?? 'popularity_total',
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      },
    }),
  );
}
