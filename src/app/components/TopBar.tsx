import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function TopBar({ title }: { title: string }) {
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
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9">
            <AvatarImage src="https://i.pravatar.cc/120?img=68" alt="Admin" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm text-white">Alex Reed</p>
            <p className="text-xs text-[#A0A0A0]">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
