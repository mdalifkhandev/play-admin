import { apiClient, authHeaders, getApiData } from "./client";
import type { PageId } from "../components/Sidebar";

export type AdminSearchItem = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  status?: string;
  adminPage: PageId;
};

export type AdminSearchResult = {
  users: AdminSearchItem[];
  creators: AdminSearchItem[];
  ads: AdminSearchItem[];
  reports: AdminSearchItem[];
  withdrawals: AdminSearchItem[];
  liveStreams: AdminSearchItem[];
  supportRequests: AdminSearchItem[];
  reels: AdminSearchItem[];
};

const SEARCH_GROUPS: (keyof AdminSearchResult)[] = [
  "users",
  "creators",
  "ads",
  "reports",
  "withdrawals",
  "liveStreams",
  "supportRequests",
  "reels",
];

export async function searchAdmin(accessToken: string, query: string, limit = 5) {
  const response = await apiClient.get("/admin/search", {
    headers: authHeaders(accessToken),
    params: { q: query, limit },
  });

  return getApiData<AdminSearchResult>(response);
}

export function flattenAdminSearchResults(result: AdminSearchResult) {
  return SEARCH_GROUPS.flatMap((group) => result[group] || []);
}
