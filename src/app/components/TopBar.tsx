import { useEffect, useMemo, useState } from "react";
import { Bell, Loader2, LogOut, Search } from "lucide-react";
import { toast } from "sonner";
import type { AdminUser } from "../api/auth";
import { getAdminNotifications, markAdminNotificationsAsRead, type AdminNotification } from "../api/notifications";
import { handleApiError } from "../api/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import type { PageId } from "./Sidebar";
import { pageForAdminNotification } from "../utils/notificationNavigation";

export function TopBar({
  title,
  user,
  accessToken,
  onLogout,
  onProfileClick,
  onNotificationsClick,
  onNotificationNavigate,
}: {
  title: string;
  user: AdminUser;
  accessToken: string;
  onLogout: () => void;
  onProfileClick: () => void;
  onNotificationsClick: () => void;
  onNotificationNavigate: (page: PageId) => void;
}) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const displayName = user.profile?.displayName || user.profile?.username || user.email.split("@")[0] || "Admin";
  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const loadNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const result = await getAdminNotifications(accessToken, 8);
      setNotifications(result.items);
    } catch (error) {
      toast.error(handleApiError(error, "Failed to load notifications."));
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    const timer = window.setInterval(() => {
      void loadNotifications();
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [accessToken]);

  const markVisibleAsRead = async () => {
    const unreadIds = notifications.filter((item) => !item.isRead).map((item) => item.id).filter(Boolean);
    if (unreadIds.length === 0) return;

    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    try {
      await markAdminNotificationsAsRead(accessToken, unreadIds);
    } catch (error) {
      toast.error(handleApiError(error, "Failed to mark notifications as read."));
      void loadNotifications();
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (nextOpen) {
      void loadNotifications();
    } else {
      void markVisibleAsRead();
    }
  };

  return (
    <header className="h-16 shrink-0 sticky top-0 z-10 bg-[#090909]/90 backdrop-blur border-b border-white/5 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#A0A0A0]">Admin</span>
        <span className="text-[#A0A0A0]">/</span>
        <span className="text-white">{title}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-[#1A1A1A] border border-white/5 rounded-lg px-3 h-9 w-64">
          <Search className="size-4 text-[#A0A0A0]" />
          <input
            placeholder="Search anything..."
            className="bg-transparent outline-none text-sm text-white placeholder:text-[#A0A0A0] w-full"
          />
        </div>
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button className="relative size-9 rounded-lg bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#A0A0A0] hover:text-white transition-colors">
              <Bell className="size-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 rounded-full bg-[#84CC16] px-1 text-[10px] leading-4 text-black font-semibold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 border-white/10 bg-[#111] p-0 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Notifications</p>
                <p className="text-xs text-[#A0A0A0]">{unreadCount} unread</p>
              </div>
              {isLoadingNotifications && <Loader2 className="size-4 animate-spin text-[#84CC16]" />}
            </div>
            <div className="max-h-80 overflow-y-auto py-2">
              {notifications.length === 0 && !isLoadingNotifications ? (
                <div className="px-4 py-8 text-center text-sm text-[#A0A0A0]">No notifications yet.</div>
              ) : (
                notifications.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setIsOpen(false);
                      onNotificationNavigate(pageForAdminNotification(item));
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-white/5 ${item.isRead ? "opacity-70" : "bg-[#84CC16]/5"}`}
                  >
                    <div className="flex gap-3">
                      <span className={`mt-1 size-2 shrink-0 rounded-full ${item.isRead ? "bg-white/20" : "bg-[#84CC16]"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{item.title || notificationTitle(item.type)}</p>
                        {item.body && <p className="mt-1 line-clamp-2 text-xs text-[#A0A0A0]">{item.body}</p>}
                        <p className="mt-1 text-[11px] text-[#6F6F6F]">{formatNotificationDate(item.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNotificationsClick();
              }}
              className="w-full border-t border-white/10 px-4 py-3 text-center text-sm font-semibold text-[#84CC16] hover:bg-white/5"
            >
              View all notifications
            </button>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          onClick={onProfileClick}
          className="flex items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors hover:bg-white/5"
          title="Edit admin profile"
        >
          <Avatar className="size-9">
            <AvatarImage src={user.profile?.photoUrl} alt={displayName} />
            <AvatarFallback>{initials || "AD"}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm text-white">{displayName}</p>
            <p className="text-xs text-[#A0A0A0]">Super Admin</p>
          </div>
        </button>
        <button
          onClick={onLogout}
          className="size-9 rounded-lg bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#A0A0A0] hover:text-white transition-colors"
          title="Logout"
        >
          <LogOut className="size-4.5" />
        </button>
      </div>
    </header>
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
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
