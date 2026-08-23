import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getAdminMe, loginAdmin, logoutAdmin, refreshAdminSession, type AdminSession } from "./api/auth";
import { Toaster } from "./components/ui/sonner";
import { NAV_ITEMS, PageId, Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { LoginScreen } from "./components/LoginScreen";
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
import { AdminProfile } from "./pages/AdminProfile";

const PAGES: Record<Exclude<PageId, "users" | "creators" | "moderation" | "ads" | "adminProfile">, () => JSX.Element> = {
  dashboard: Dashboard,
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

const STORAGE_KEY = "play-admin-session";

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const Page = page !== "users" && page !== "creators" && page !== "moderation" && page !== "ads" && page !== "adminProfile" ? PAGES[page] : null;
  const title = page === "adminProfile" ? "Admin Profile" : NAV_ITEMS.find((n) => n.id === page)?.label ?? "Dashboard";

  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setIsRestoring(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored) as AdminSession;
        const user = await getAdminMe(parsed.accessToken);
        setSession({ ...parsed, user });
      } catch {
        try {
          const parsed = JSON.parse(stored) as AdminSession;
          const refreshed = await refreshAdminSession(parsed.refreshToken);
          saveSession(refreshed);
          setSession(refreshed);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        setIsRestoring(false);
      }
    };

    void restore();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const nextSession = await loginAdmin(email, password);
    saveSession(nextSession);
    setSession(nextSession);
  };

  const handleLogout = () => {
    const currentSession = session;
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    if (currentSession) {
      void logoutAdmin(currentSession.refreshToken, currentSession.accessToken);
    }
  };

  const handleUserUpdate = (user: AdminSession["user"]) => {
    if (!session) {
      return;
    }

    const nextSession = { ...session, user };
    saveSession(nextSession);
    setSession(nextSession);
  };

  if (isRestoring) {
    return (
      <div className="dark min-h-screen bg-[#090909] text-white flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#84CC16]" />
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster theme="dark" position="top-right" />
      </>
    );
  }

  return (
    <div className="dark size-full min-h-screen flex bg-[#090909] text-white">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} user={session.user} onLogout={handleLogout} onProfileClick={() => setPage("adminProfile")} />
        <main className="flex-1 overflow-y-auto p-6">
          {page === "adminProfile" ? (
            <AdminProfile accessToken={session.accessToken} user={session.user} onUserUpdate={handleUserUpdate} />
          ) : page === "users" ? (
            <UserManagement accessToken={session.accessToken} />
          ) : page === "creators" ? (
            <CreatorManagement accessToken={session.accessToken} />
          ) : page === "moderation" ? (
            <ContentModeration accessToken={session.accessToken} />
          ) : page === "ads" ? (
            <AdManagement accessToken={session.accessToken} />
          ) : (
            Page && <Page />
          )}
        </main>
      </div>
      <Toaster theme="dark" position="top-right" />
    </div>
  );
}

function saveSession(session: AdminSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
