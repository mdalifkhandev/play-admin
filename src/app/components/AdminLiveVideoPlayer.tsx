import { useEffect, useRef, useState } from "react";
import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type IRemoteAudioTrack,
  type IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";
import { Loader2, Volume2, VolumeX } from "lucide-react";
import { getAdminLiveStreamToken } from "../api/liveStreams";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type AdminLiveVideoPlayerProps = {
  accessToken: string;
  streamId: string;
  fallbackImage?: string;
  alt: string;
};

export function AdminLiveVideoPlayer({ accessToken, streamId, fallbackImage, alt }: AdminLiveVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const audioTrackRef = useRef<IRemoteAudioTrack | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    let disposed = false;
    let renewalTimer: ReturnType<typeof setTimeout> | undefined;

    const join = async () => {
      setIsConnecting(true);
      setHasVideo(false);

      try {
        const tokenInfo = await getAdminLiveStreamToken(accessToken, streamId);
        if (disposed) return;

        const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        clientRef.current = client;
        await client.setClientRole("audience");

        const handleUserPublished = async (
          user: IAgoraRTCRemoteUser,
          mediaType: "audio" | "video" | "datachannel",
        ) => {
          if (mediaType !== "audio" && mediaType !== "video") return;
          await client.subscribe(user, mediaType);
          if (disposed) return;

          if (mediaType === "video") {
            const videoTrack = user.videoTrack as IRemoteVideoTrack | undefined;
            if (videoTrack && containerRef.current) {
              containerRef.current.innerHTML = "";
              videoTrack.play(containerRef.current, { fit: "cover" });
              setHasVideo(true);
            }
          }

          if (mediaType === "audio") {
            audioTrackRef.current = user.audioTrack ?? null;
            if (!isMuted) {
              user.audioTrack?.play();
            }
          }
        };

        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", (_user, mediaType) => {
          if (mediaType === "video") setHasVideo(false);
          if (mediaType === "audio") audioTrackRef.current = null;
        });

        await client.join(tokenInfo.appId, tokenInfo.channelName, tokenInfo.token, tokenInfo.uid);
        renewalTimer = setTimeout(
          async () => {
            try {
              const freshToken = await getAdminLiveStreamToken(accessToken, streamId);
              await client.renewToken(freshToken.token);
            } catch {
              // The next stream refresh or page reload can recover token renewal failures.
            }
          },
          Math.max(60, tokenInfo.expiresInSeconds - 120) * 1000,
        );
      } catch {
        setHasVideo(false);
      } finally {
        if (!disposed) setIsConnecting(false);
      }
    };

    void join();

    return () => {
      disposed = true;
      if (renewalTimer) clearTimeout(renewalTimer);
      audioTrackRef.current?.stop();
      audioTrackRef.current = null;
      const client = clientRef.current;
      clientRef.current = null;
      if (client) {
        client.removeAllListeners();
        void client.leave();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [accessToken, streamId]);

  const toggleAudio = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      audioTrackRef.current?.stop();
    } else {
      audioTrackRef.current?.play();
    }
  };

  return (
    <div className="relative size-full bg-black">
      {!hasVideo && (
        <ImageWithFallback src={fallbackImage || ""} alt={alt} className="absolute inset-0 size-full object-cover" />
      )}
      <div ref={containerRef} className="absolute inset-0 size-full overflow-hidden" />
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}
      <button
        type="button"
        onClick={toggleAudio}
        className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
        aria-label={isMuted ? "Unmute live audio" : "Mute live audio"}
      >
        {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  );
}
