import { apiClient, authHeaders, getApiData } from './client';

export type AdminRewardSettings = {
  periodDays: number;
  leaderboardLimit: number;
  viewsWeight: number;
  likesWeight: number;
  commentsWeight: number;
  sharesWeight: number;
  followersWeight: number;
  isActive: boolean;
};

export type AdminRewardProgram = {
  id: string;
  name: string;
  reward: string;
  eligibilityCriteria: string;
  cycle: 'weekly' | 'monthly' | 'yearly' | 'custom';
  isActive: boolean;
  sortOrder: number;
};

export type AdminRewardLeaderboardRow = {
  rank: number;
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  followers: number;
  likes: number;
  engagement: number;
  score: number;
};

export type AdminRewardWinner = {
  id: string;
  year: string;
  winner: string;
  reward: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  rank: number;
  score: number;
};

export type AdminRewardDashboard = {
  settings: AdminRewardSettings;
  programs: AdminRewardProgram[];
  winners: AdminRewardWinner[];
  leaderboard: AdminRewardLeaderboardRow[];
};

export type AdminRewardProgramInput = {
  name: string;
  reward: string;
  eligibilityCriteria: string;
  cycle: 'weekly' | 'monthly' | 'yearly' | 'custom';
  isActive: boolean;
  sortOrder: number;
};

export async function getAdminRewardDashboard(accessToken: string) {
  return getApiData<AdminRewardDashboard>(
    await apiClient.get('/admin/rewards/dashboard', {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function updateAdminRewardSettings(accessToken: string, input: AdminRewardSettings) {
  return getApiData<AdminRewardSettings>(
    await apiClient.put('/admin/rewards/settings', input, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function createAdminRewardProgram(accessToken: string, input: AdminRewardProgramInput) {
  return getApiData<AdminRewardProgram>(
    await apiClient.post('/admin/rewards/programs', input, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function updateAdminRewardProgram(
  accessToken: string,
  programId: string,
  input: Partial<AdminRewardProgramInput>,
) {
  return getApiData<AdminRewardProgram>(
    await apiClient.put(`/admin/rewards/programs/${encodeURIComponent(programId)}`, input, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function finalizeAdminRewardWinners(
  accessToken: string,
  input: { programId?: string; limit?: number; cycleLabel?: string },
) {
  return getApiData<AdminRewardWinner[]>(
    await apiClient.post('/admin/rewards/winners/finalize', input, {
      headers: authHeaders(accessToken),
    }),
  );
}

export async function updateAdminRewardWinnerStatus(
  accessToken: string,
  winnerId: string,
  status: AdminRewardWinner['status'],
) {
  return getApiData<AdminRewardWinner>(
    await apiClient.patch(
      `/admin/rewards/winners/${encodeURIComponent(winnerId)}/status`,
      { status },
      { headers: authHeaders(accessToken) },
    ),
  );
}
