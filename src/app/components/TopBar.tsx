import { Bell, LogOut, Search } from "lucide-react";
import type { AdminUser } from "../api/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function TopBar({
  title,
  user,
  onLogout,
  onProfileClick,
}: {
  title: string;
  user: AdminUser;
  onLogout: () => void;
  onProfileClick: () => void;
}) {
  const displayName = user.profile?.displayName || user.profile?.username || user.email.split("@")[0] || "Admin";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
        <button className="relative size-9 rounded-lg bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-[#A0A0A0] hover:text-white transition-colors">
          <Bell className="size-4.5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[#84CC16]" />
        </button>
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
