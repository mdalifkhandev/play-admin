import { useEffect, useState } from "react";
import { Bell, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { getAdminNotifications, markAdminNotificationsAsRead, type AdminNotification } from "../api/notifications";
import { handleApiError } from "../api/client";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import type { PageId } from "../components/Sidebar";
import { pageForAdminNotification } from "../utils/notificationNavigation";

export function AdminNotifications({
  accessToken,
  onNotificationNavigate,
}: {
  accessToken: string;
  onNotificationNavigate: (page: PageId) => void;
}) {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const unreadCount = items.filter((item) => !item.isRead).length;

  const loadNotifications = async (cursor?: string | null) => {
    cursor ? setIsLoadingMore(true) : setIsLoading(true);
    try {
      const result = await getAdminNotifications(accessToken, 20, cursor);
      setItems((current) => (cursor ? [...current, ...result.items] : result.items));
      setNextCursor(result.nextCursor);
    } catch (error) {
      toast.error(handleApiError(error, "Failed to load notifications."));
    } finally {
      cursor ? setIsLoadingMore(false) : setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [accessToken]);

  const markAllAsRead = async () => {
    const unreadIds = items.filter((item) => !item.isRead).map((item) => item.id).filter(Boolean);
    if (unreadIds.length === 0) return;

    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    try {
      await markAdminNotificationsAsRead(accessToken, unreadIds);
      toast.success("Notifications marked as read");
    } catch (error) {
      toast.error(handleApiError(error, "Failed to mark notifications as read."));
      void loadNotifications();
    }
  };

  const markNotificationAsRead = async (notification: AdminNotification) => {
    if (notification.isRead || !notification.id) return;

    setItems((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
    );
    try {
      await markAdminNotificationsAsRead(accessToken, [notification.id]);
    } catch (error) {
      toast.error(handleApiError(error, "Failed to mark notification as read."));
      void loadNotifications();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Notifications"
        subtitle="All notifications sent to this admin account"
        actions={
          <>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent hover:bg-white/5"
              onClick={() => loadNotifications()}
              disabled={isLoading}
            >
              <RefreshCcw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button
              className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
          </>
        }
      />

      <Panel
        title="Notification Inbox"
        action={<StatusPill status={unreadCount > 0 ? `${unreadCount} Unread` : "Completed"} />}
      >
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-7 animate-spin text-[#84CC16]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Bell className="size-10 text-[#A0A0A0]" />
            <p className="mt-4 text-white">No notifications yet</p>
            <p className="mt-1 text-sm text-[#A0A0A0]">New platform alerts will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  void markNotificationAsRead(item);
                  onNotificationNavigate(pageForAdminNotification(item));
                }}
                className={`flex w-full gap-4 py-4 text-left transition-colors hover:bg-white/[0.03] ${item.isRead ? "opacity-70" : ""}`}
              >
                <div className={`mt-1 size-2.5 shrink-0 rounded-full ${item.isRead ? "bg-white/20" : "bg-[#84CC16]"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-white">{item.title || notificationTitle(item.type)}</h3>
                    <StatusPill status={item.isRead ? "Completed" : "Active"} />
                  </div>
                  {item.body && <p className="mt-2 text-sm leading-6 text-[#A0A0A0]">{item.body}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6F6F6F]">
                    <span>{notificationTitle(item.type)}</span>
                    <span>{formatNotificationDate(item.createdAt)}</span>
                    {item.relatedEntityId && <span>Entity: {item.relatedEntityId}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {nextCursor && (
          <div className="mt-5 flex justify-center">
            <Button
              variant="outline"
              className="border-white/10 bg-transparent hover:bg-white/5"
              disabled={isLoadingMore}
              onClick={() => loadNotifications(nextCursor)}
            >
              {isLoadingMore ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Load more
            </Button>
          </div>
        )}
      </Panel>
    </div>
  );
}

function notificationTitle(type: string) {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
