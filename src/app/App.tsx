import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { NAV_ITEMS, PageId, Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./pages/Dashboard";
import { UserManagement } from "./pages/UserManagement";
import { CreatorManagement } from "./pages/CreatorManagement";
import { ContentModeration } from "./pages/ContentModeration";
import { AdManagement } from "./pages/AdManagement";
import { Monetization } from "./pages/Monetization";
import { Withdrawals } from "./pages/Withdrawals";
import { Subscriptions } from "./pages/Subscriptions";
import { Rewards } from "./pages/Rewards";
import { LiveManagement } from "./pages/LiveManagement";
import { KidsMode } from "./pages/KidsMode";
import { CoinGift } from "./pages/CoinGift";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";

const PAGES: Record<PageId, () => JSX.Element> = {
  dashboard: Dashboard,
  users: UserManagement,
  creators: CreatorManagement,
  moderation: ContentModeration,
  ads: AdManagement,
  monetization: Monetization,
  withdrawals: Withdrawals,
  subscriptions: Subscriptions,
  rewards: Rewards,
  live: LiveManagement,
  kids: KidsMode,
  coins: CoinGift,
  notifications: Notifications,
  settings: Settings,
};

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const Page = PAGES[page];
  const title = NAV_ITEMS.find((n) => n.id === page)?.label ?? "Dashboard";

  return (
    <div className="dark size-full min-h-screen flex bg-[#090909] text-white">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Page />
        </main>
      </div>
      <Toaster theme="dark" position="top-right" />
    </div>
  );
}
