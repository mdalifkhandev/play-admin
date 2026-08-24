import {
  LayoutDashboard,
  Users,
  Star,
  ShieldAlert,
  Megaphone,
  DollarSign,
  Wallet,
  CreditCard,
  Trophy,
  Radio,
  Bell,
  Settings,
  Baby,
  Coins,
} from "lucide-react";
import { cn } from "./ui/utils";
import logo from "../../assets/logo.png";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "creators", label: "Creator Management", icon: Star },
  { id: "moderation", label: "Content Moderation", icon: ShieldAlert },
  { id: "ads", label: "Ad Management", icon: Megaphone },
  { id: "monetization", label: "Monetization & Revenue", icon: DollarSign },
  { id: "withdrawals", label: "Withdrawal Management", icon: Wallet },
  { id: "subscriptions", label: "Subscription Management", icon: CreditCard },
  { id: "rewards", label: "Rewards & Leaderboard", icon: Trophy },
  { id: "live", label: "Live Management", icon: Radio },
  { id: "kids", label: "Kids Mode Management", icon: Baby },
  { id: "coins", label: "Coin & Gift Management", icon: Coins },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type PageId = (typeof NAV_ITEMS)[number]["id"] | "adminProfile" | "adminNotifications";

export function Sidebar({ active, onNavigate }: { active: PageId; onNavigate: (id: PageId) => void }) {
  return (
    <aside className="w-60 shrink-0 bg-[#090909] border-r border-white/5 flex flex-col h-screen sticky top-0">
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        className="flex items-center justify-center gap-2.5 px-5 h-16 border-b border-white/5 transition-colors hover:bg-white/[0.03]"
        aria-label="Go to dashboard"
      >
        <div className="size-12 rounded-lg flex items-center justify-center border border-[#84CC16]">
          <img src={logo} alt="Play" className="size-12 object-contain" />
        </div>
        <h1 className="text-2xl font-semibold tracking-wide text-white">
          Pl<span className="text-[#84CC16]">ay</span>
        </h1>
      </button>
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors border-l-2",
                isActive
                  ? "bg-[#84CC16]/10 text-white border-[#84CC16]"
                  : "text-[#A0A0A0] border-transparent hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className={cn("size-4.5 shrink-0", isActive ? "text-[#84CC16]" : "")} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-white/5 text-xs text-[#A0A0A0]">v2.4 · Admin Console</div>
    </aside>
  );
}
