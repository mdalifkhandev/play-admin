import { useEffect, useState } from "react";
import { getAdminMe, loginAdmin, logoutAdmin, refreshAdminSession, type AdminSession } from "./api/auth";
import { Toaster } from "./components/ui/sonner";
import { canAccessPage, getDefaultPageForRole, NAV_ITEMS, PageId, Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { LoginScreen } from "./components/LoginScreen";
import { Dashboard } from "./pages/Dashboard";
import { UserManagement } from "./pages/UserManagement";
import { CreatorManagement } from "./pages/CreatorManagement";
import { ContentModeration } from "./pages/ContentModeration";
import { ContentManagement } from "./pages/ContentManagement";
import { AdManagement } from "./pages/AdManagement";
import { Monetization } from "./pages/Monetization";
import { Withdrawals } from "./pages/Withdrawals";
import { Subscriptions } from "./pages/Subscriptions";
import { Rewards } from "./pages/Rewards";
import { LiveManagement } from "./pages/LiveManagement";
import { MusicManagement } from "./pages/MusicManagement";
import { KidsMode } from "./pages/KidsMode";
import { CoinGift } from "./pages/CoinGift";
import { Notifications } from "./pages/Notifications";
import { SupportRequests } from "./pages/SupportRequests";
import { AdminAudit } from "./pages/AdminAudit";
import { Settings } from "./pages/Settings";
import { AdminProfile } from "./pages/AdminProfile";
import { AdminNotifications } from "./pages/AdminNotifications";

const STORAGE_KEY = "play-admin-session";

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [session, setSession] = useState<AdminSession | null>(() => getStoredSession());
  const title = page === "adminProfile" ? "Admin Profile" : page === "adminNotifications" ? "Admin Notifications" : NAV_ITEMS.find((n) => n.id === page)?.label ?? "Dashboard";
  const role = session?.user.role;

  useEffect(() => {
    document.title = `${title} | Play Admin`;
  }, [title]);

  useEffect(() => {
    if (session && !canAccessPage(role, page)) {
      setPage(getDefaultPageForRole(role));
    }
  }, [page, role, session]);

  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
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
          setSession(null);
        }
      }
    };

    void restore();
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
    };

    const handleSessionRefreshed = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      try {
        setSession(JSON.parse(stored) as AdminSession);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      }
    };

    window.addEventListener("play-admin-session-expired", handleSessionExpired);
    window.addEventListener("play-admin-session-refreshed", handleSessionRefreshed);

    return () => {
      window.removeEventListener("play-admin-session-expired", handleSessionExpired);
      window.removeEventListener("play-admin-session-refreshed", handleSessionRefreshed);
    };
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

  const handleNavigate = (nextPage: PageId) => {
    if (canAccessPage(role, nextPage)) {
      setPage(nextPage);
      return;
    }

    setPage(getDefaultPageForRole(role));
  };

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
      <Sidebar active={page} role={role} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title={title}
          user={session.user}
          accessToken={session.accessToken}
          onLogout={handleLogout}
          onProfileClick={() => handleNavigate("adminProfile")}
          onNotificationsClick={() => handleNavigate("adminNotifications")}
          onNotificationNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {page === "adminProfile" ? (
            <AdminProfile accessToken={session.accessToken} user={session.user} onUserUpdate={handleUserUpdate} />
          ) : page === "adminNotifications" ? (
            <AdminNotifications accessToken={session.accessToken} onNotificationNavigate={setPage} />
          ) : page === "users" ? (
            <UserManagement accessToken={session.accessToken} />
          ) : page === "creators" ? (
            <CreatorManagement accessToken={session.accessToken} />
          ) : page === "moderation" ? (
            <ContentModeration accessToken={session.accessToken} />
          ) : page === "content" ? (
            <ContentManagement accessToken={session.accessToken} />
          ) : page === "ads" ? (
            <AdManagement accessToken={session.accessToken} />
          ) : page === "monetization" ? (
            <Monetization accessToken={session.accessToken} />
          ) : page === "withdrawals" ? (
            <Withdrawals accessToken={session.accessToken} />
          ) : page === "subscriptions" ? (
            <Subscriptions accessToken={session.accessToken} />
          ) : page === "rewards" ? (
            <Rewards accessToken={session.accessToken} />
          ) : page === "live" ? (
            <LiveManagement accessToken={session.accessToken} />
          ) : page === "music" ? (
            <MusicManagement />
          ) : page === "kids" ? (
            <KidsMode accessToken={session.accessToken} />
          ) : page === "coins" ? (
            <CoinGift accessToken={session.accessToken} />
          ) : page === "notifications" ? (
            <Notifications accessToken={session.accessToken} />
          ) : page === "support" ? (
            <SupportRequests accessToken={session.accessToken} />
          ) : page === "audit" ? (
            <AdminAudit accessToken={session.accessToken} />
          ) : page === "settings" ? (
            <Settings accessToken={session.accessToken} />
          ) : page === "dashboard" ? (
            <Dashboard accessToken={session.accessToken} />
          ) : (
            null
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

function getStoredSession() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AdminSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
