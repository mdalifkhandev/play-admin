import { apiClient, authHeaders, getApiData } from './client';

export type AdminDashboardSummary = {
  totalUsers: number;
  totalCreators: number;
  revenueToday: number;
  revenueThisMonth: number;
  pendingPayouts: number;
  activeUsers24h: number;
  pendingReports: number;
  totalUsersChangePercent: number;
  totalCreatorsChangePercent: number;
  revenueTodayChangePercent: number;
  revenueThisMonthChangePercent: number;
  userGrowth: { day: string; users: number }[];
  revenueTrend: { month: string; revenue: number }[];
  activeUsers: { hour: string; active: number }[];
  recentActivity: { id: string; type: 'signup' | 'approval' | 'flag'; text: string; time: string }[];
};

export async function getAdminDashboardSummary(accessToken: string) {
  return getApiData<AdminDashboardSummary>(
    await apiClient.get('/admin/dashboard/summary', {
      headers: authHeaders(accessToken),
    }),
  );
}
