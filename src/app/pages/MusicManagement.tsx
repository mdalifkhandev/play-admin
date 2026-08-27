import { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Loader2, Music2, Pause, Play, RefreshCw, Search, Square } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminMusicTracksQuery } from '../api/music.query';
import type { AdminMusicTrack } from '../api/music';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { PageHeader, Panel, SectionLoading } from '../components/shared';

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

export function MusicManagement() {
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const params = useMemo(
    () => ({
      search,
      page,
      limit: 20,
      order: 'popularity_total' as const,
    }),
    [page, search],
  );

  const tracksQuery = useAdminMusicTracksQuery(params);
  const tracks = tracksQuery.data?.tracks ?? [];
  const pagination = tracksQuery.data?.pagination;

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
    setLoadingId(null);
  };

  const toggleAudio = async (track: AdminMusicTrack) => {
    const trackKey = `${track.provider}-${track.providerTrackId}`;

    if (playingId === trackKey || loadingId === trackKey) {
      stopAudio();
      return;
    }

    if (!track.audioPreviewUrl) {
      toast.error('Audio preview URL is missing.');
      return;
    }

    stopAudio();
    setLoadingId(trackKey);

    const audio = new Audio(track.audioPreviewUrl);
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.onended = stopAudio;
    audio.onerror = () => {
      console.log('Admin music audio playback error:', {
        trackId: track.providerTrackId,
        title: track.title,
        audioPreviewUrl: track.audioPreviewUrl,
      });
      stopAudio();
      toast.error('Audio preview play করা যাচ্ছে না।');
    };

    try {
      await audio.play();
      setLoadingId(null);
      setPlayingId(trackKey);
    } catch (error) {
      console.log('Admin music audio playback error:', {
        trackId: track.providerTrackId,
        title: track.title,
        audioPreviewUrl: track.audioPreviewUrl,
        error,
      });
      stopAudio();
      toast.error('Audio preview play করা যাচ্ছে না।');
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  };

  const handleRefresh = async () => {
    stopAudio();
    await tracksQuery.refetch();
  };

  return (
    <div>
      <PageHeader
        title="Music Management"
        subtitle="Search, preview and control app music from the dashboard"
        actions={
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-transparent hover:bg-white/5"
            onClick={handleRefresh}
            disabled={tracksQuery.isFetching}
          >
            <RefreshCw className={`mr-2 size-4 ${tracksQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <Panel>
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A0A0A0]" />
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search music by title or artist"
              className="h-11 border-white/10 bg-[#111] pl-10 text-white placeholder:text-[#777]"
            />
          </div>
          <Button type="submit" className="h-11 bg-[#84CC16] text-black hover:bg-[#84CC16]/90">
            Search
          </Button>
        </form>
      </Panel>

      <Panel
        className="mt-5"
        title="Audio Tracks"
        action={
          <span className="text-sm text-[#A0A0A0]">
            {pagination ? `${pagination.total} tracks` : tracksQuery.isLoading ? 'Loading' : '0 tracks'}
          </span>
        }
      >
        {tracksQuery.isLoading ? (
          <SectionLoading label="Loading music tracks..." />
        ) : tracksQuery.isError ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            Music load করা যায়নি। Backend tunnel/API বা `JAMENDO_CLIENT_ID` check করো।
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-[#A0A0A0]">
            <Music2 className="size-10" />
            <div>
              <p className="text-white">No music found</p>
              <p className="text-sm">Search বা Refresh করলে API থেকে নতুন data আসবে।</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => {
              const trackKey = `${track.provider}-${track.providerTrackId}`;
              const isPlaying = playingId === trackKey;
              const isLoading = loadingId === trackKey;

              return (
                <div
                  key={trackKey}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-white/5 bg-[#111] p-3"
                >
                  <ImageWithFallback
                    src={track.coverImageUrl ?? undefined}
                    alt={track.title}
                    className="size-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-white">{track.title}</h3>
                      <Badge variant="outline" className="border-white/10 text-[#A0A0A0]">
                        {formatDuration(track.durationSeconds)}
                      </Badge>
                      {track.downloadAllowed && (
                        <Badge variant="outline" className="border-[#84CC16]/30 text-[#84CC16]">
                          Download allowed
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-[#A0A0A0]">
                      {track.artistName}
                      {track.albumName ? ` · ${track.albumName}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="min-w-24 bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
                      onClick={() => void toggleAudio(track)}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="mr-2 size-4" />
                      ) : (
                        <Play className="mr-2 size-4" />
                      )}
                      {isLoading ? 'Loading' : isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    {isPlaying && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-white/10 bg-transparent hover:bg-white/5"
                        onClick={stopAudio}
                      >
                        <Square className="mr-2 size-4" />
                        Stop
                      </Button>
                    )}
                    {track.shareUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="border-white/10 bg-transparent hover:bg-white/5"
                        onClick={() => window.open(track.shareUrl ?? '', '_blank', 'noopener,noreferrer')}
                        aria-label="Open track"
                      >
                        <ExternalLink className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination && pagination.total > pagination.limit && (
          <div className="mt-5 flex items-center justify-between text-sm text-[#A0A0A0]">
            <span>Page {pagination.page}</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/10 bg-transparent hover:bg-white/5"
                disabled={page <= 1 || tracksQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-white/10 bg-transparent hover:bg-white/5"
                disabled={!pagination.hasNextPage || tracksQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
