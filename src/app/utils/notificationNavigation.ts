import type { PageId } from "../components/Sidebar";
import type { AdminNotification } from "../api/notifications";

const ADMIN_PAGES = new Set<PageId>([
  "dashboard",
  "users",
  "creators",
  "moderation",
  "ads",
  "monetization",
  "withdrawals",
  "subscriptions",
  "rewards",
  "live",
  "kids",
  "coins",
  "notifications",
  "settings",
  "adminProfile",
  "adminNotifications",
]);

export function pageForAdminNotification(notification: AdminNotification): PageId {
  const page = notification.data?.adminPage;
  if (typeof page === "string" && ADMIN_PAGES.has(page as PageId)) {
    return page as PageId;
  }

  const text = `${notification.title || ""} ${notification.body || ""}`.toLowerCase();

  if (text.includes("creator")) return "creators";
  if (text.includes("ad campaign") || text.includes("campaign")) return "ads";
  if (text.includes("withdrawal")) return "withdrawals";
  if (text.includes("report") || text.includes("moderation") || text.includes("reel processing")) return "moderation";
  if (text.includes("support")) return "settings";
  if (text.includes("live") || text.includes("recording")) return "live";

  return "adminNotifications";
}
