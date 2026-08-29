import { useEffect, useState } from "react";
import { Eye, Loader2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { handleApiError } from "../api/client";
import {
  useAdminRecordedLiveStreamsQuery,
  useAdminLiveStreamsQuery,
  useForceEndAdminLiveStreamMutation,
} from "../api/liveStreams.query";
import type { AdminLiveStream } from "../api/liveStreams";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { AdminLiveVideoPlayer } from "../components/AdminLiveVideoPlayer";
import { formatNumber } from "../data";

type LiveManagementProps = {
  accessToken: string;
};

export function LiveManagement({ accessToken }: LiveManagementProps) {
  const ongoingQuery = useAdminLiveStreamsQuery(accessToken, { status: "LIVE", limit: 20 });
  const recordedQuery = useAdminRecordedLiveStreamsQuery(accessToken, { limit: 50 });
  const historyQuery = useAdminLiveStreamsQuery(accessToken, { status: "ENDED", limit: 50 });
  const forceEndMutation = useForceEndAdminLiveStreamMutation(accessToken);

  const forceEnd = async (streamId?: string) => {
    if (!streamId) return;
    try {
      await forceEndMutation.mutateAsync(streamId);
      toast.success("Live stream ended.");
    } catch (error) {
      toast.error(handleApiError(error, "Failed to end live stream."));
    }
  };

  const ongoingStreams = (ongoingQuery.data?.items ?? []) as AdminLiveStream[];
  const streamHistory = (historyQuery.data?.items ?? []) as AdminLiveStream[];
  const recordedStreams = recordedQuery.data?.items ?? [];

  return (
    <div>
      <PageHeader title="Live Management" subtitle="Monitor and moderate live streams" />
      <Tabs defaultValue="ongoing">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="ongoing">Ongoing Streams</TabsTrigger>
          <TabsTrigger value="recorded">Recorded Streams</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-4">
          {ongoingQuery.isLoading ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {ongoingStreams.map((stream) => (
                <div key={stream.id} className="rounded-xl bg-[#1A1A1A] border border-white/5 overflow-hidden">
                  <div className="relative aspect-video">
                    <AdminLiveVideoPlayer
                      accessToken={accessToken}
                      streamId={stream.id}
                      fallbackImage={stream.coverImage || stream.hostId.avatarUrl}
                      alt={stream.hostId.displayName}
                    />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-md">
                      <span className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE
                    </span>
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-black/60 backdrop-blur text-white text-xs px-2 py-0.5 rounded-md">
                      <Eye className="size-3" /> {formatNumber(stream.viewerCount)}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-white text-sm mb-1">{stream.hostId.displayName}</p>
                    <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[#A0A0A0]">
                      <p className="line-clamp-1">{stream.title}</p>
                      <RunningDuration startedAt={stream.startedAt || stream.createdAt} />
                    </div>
                    <Button
                      size="sm"
                      disabled={forceEndMutation.isPending}
                      onClick={() => forceEnd(stream.id)}
                      className="w-full bg-red-500 text-white hover:bg-red-500/90"
                    >
                      {forceEndMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                      Force End
                    </Button>
                  </div>
                </div>
              ))}
              {ongoingStreams.length === 0 && (
                <div className="col-span-full rounded-xl bg-[#1A1A1A] border border-white/5 p-8 text-center text-[#A0A0A0]">
                  No live streams are running.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recorded" className="mt-4">
          {recordedQuery.isLoading ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {recordedStreams.map((stream) => {
                const recordingUrl = stream.recording?.playbackUrls?.[0] ?? getRecordingUrl(stream.recording?.fileList);
                return (
                  <div key={stream.id} className="rounded-xl bg-[#1A1A1A] border border-white/5 overflow-hidden">
                    <div className="relative aspect-video bg-black">
                      {recordingUrl ? (
                        <video
                          src={recordingUrl}
                          controls
                          preload="metadata"
                          poster={stream.coverImage || stream.hostId.avatarUrl}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-white/[0.03] text-[#A0A0A0]">
                          <PlayCircle className="mb-2 size-8 text-[#84CC16]" />
                          <span className="px-4 text-center text-xs">
                            {recordingMessage(stream)}
                          </span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-black/60 backdrop-blur text-white text-xs px-2 py-0.5 rounded-md">
                        {stream.recording?.status || "recorded"}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-white text-sm mb-1">{stream.hostId.displayName}</p>
                      <p className="text-xs text-[#A0A0A0] mb-2 line-clamp-1">{stream.title}</p>
                      <div className="flex items-center justify-between text-xs text-[#A0A0A0]">
                        <span>{formatDate(stream.endedAt || stream.startedAt || stream.createdAt)}</span>
                        <span>{formatDuration(stream.durationSeconds)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {recordedStreams.length === 0 && (
                <div className="col-span-full rounded-xl bg-[#1A1A1A] border border-white/5 p-8 text-center text-[#A0A0A0]">
                  No recorded streams yet.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Panel>
            {historyQuery.isLoading ? (
              <LoadingState />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                    <TableHead className="text-[#A0A0A0]">Date</TableHead>
                    <TableHead className="text-[#A0A0A0]">Duration</TableHead>
                    <TableHead className="text-[#A0A0A0]">Peak Viewers</TableHead>
                    <TableHead className="text-[#A0A0A0]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streamHistory.map((stream, i) => (
                    <TableRow key={stream.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                      <TableCell className="text-white">{stream.hostId.displayName}</TableCell>
                      <TableCell className="text-[#A0A0A0]">{formatDate(stream.startedAt || stream.createdAt)}</TableCell>
                      <TableCell className="text-[#A0A0A0]">{formatDuration(stream.durationSeconds)}</TableCell>
                      <TableCell className="text-white">{formatNumber(stream.peakViewerCount)}</TableCell>
                      <TableCell><StatusPill status={stream.status === "ENDED" ? "Completed" : stream.status} /></TableCell>
                    </TableRow>
                  ))}
                  {streamHistory.length === 0 && (
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                        No live stream history yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-10 text-[#A0A0A0]">
      <Loader2 className="mr-2 size-5 animate-spin text-[#84CC16]" />
      Loading live streams...
    </div>
  );
}

function RunningDuration({ startedAt }: { startedAt?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!startedAt) return null;

  const started = new Date(startedAt).getTime();
  if (!Number.isFinite(started)) return null;

  return (
    <span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 text-[#84CC16]">
      {formatRunningDuration(Math.floor((now - started) / 1000))}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatRunningDuration(seconds: number) {
  const total = Math.max(0, seconds || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number) {
  const total = Math.max(0, seconds || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getRecordingUrl(fileList: unknown): string | undefined {
  if (!fileList) return undefined;
  if (typeof fileList === "string") return isVideoUrl(fileList) ? fileList : undefined;

  const queue: unknown[] = [fileList];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (typeof current === "string" && isVideoUrl(current)) return current;
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    if (typeof current === "object") {
      const record = current as Record<string, unknown>;
      for (const key of ["url", "fileUrl", "fileURL", "downloadUrl", "playUrl", "location", "fileName"]) {
        const value = record[key];
        if (typeof value === "string" && isVideoUrl(value)) return value;
      }
      queue.push(...Object.values(record));
    }
  }

  return undefined;
}

function isVideoUrl(value: string) {
  return /^https?:\/\//i.test(value) && /\.(mp4|m3u8|mov|webm)(\?|$)/i.test(value);
}

function recordingMessage(stream: AdminLiveStream) {
  if (stream.recording?.errorMessage) return stream.recording.errorMessage;
  if (stream.recording?.status === "disabled") return "Recording is disabled on the backend.";
  if (stream.recording?.status === "failed") return "Recording failed.";
  if (stream.recording?.status === "stopped") return "Recording finished, but no playable video URL was found.";
  return "Recording file is processing.";
}
