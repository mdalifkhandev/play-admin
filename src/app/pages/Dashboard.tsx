import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Award, Clock, Flag, Loader2, Trophy, UserPlus } from "lucide-react";
import { useAdminDashboardSummaryQuery } from "../api/dashboard.query";
import { useAdminRewardDashboardQuery } from "../api/rewards.query";
import { PageHeader, Panel, StatCard, StatusPill } from "../components/shared";
import {
  formatMoney,
  formatNumber,
} from "../data";

const tooltipStyle = {
  backgroundColor: "#1A1A1A",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#fff",
};

const activityIcon: Record<string, React.ReactNode> = {
  signup: <UserPlus className="size-4 text-[#84CC16]" />,
  approval: <Clock className="size-4 text-amber-400" />,
  flag: <Flag className="size-4 text-red-400" />,
};

export function Dashboard({ accessToken }: { accessToken: string }) {
  const summaryQuery = useAdminDashboardSummaryQuery(accessToken);
  const rewardsQuery = useAdminRewardDashboardQuery(accessToken);
  const summary = summaryQuery.data;
  const rewardData = rewardsQuery.data;
  const userGrowthData = summary?.userGrowth ?? [];
  const revenueTrendData = summary?.revenueTrend ?? [];
  const activeUsersData = summary?.activeUsers ?? [];
  const recentActivityData = summary?.recentActivity ?? [];
  const pendingWinners = rewardData?.winners.filter((winner) => winner.status === "pending").length ?? 0;
  const paidWinners = rewardData?.winners.filter((winner) => winner.status === "paid").length ?? 0;
  const activePrograms = rewardData?.programs.filter((program) => program.isActive).length ?? 0;
  const topCreator = rewardData?.leaderboard[0];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform overview and key metrics at a glance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={summaryQuery.isLoading ? "..." : formatNumber(summary?.totalUsers ?? 0)}
          change={formatChange(summary?.totalUsersChangePercent)}
          positive={(summary?.totalUsersChangePercent ?? 0) >= 0}
        />
        <StatCard
          label="Total Creators"
          value={summaryQuery.isLoading ? "..." : formatNumber(summary?.totalCreators ?? 0)}
          change={formatChange(summary?.totalCreatorsChangePercent)}
          positive={(summary?.totalCreatorsChangePercent ?? 0) >= 0}
        />
        <StatCard
          label="Revenue Today"
          value={summaryQuery.isLoading ? "..." : formatMoney(summary?.revenueToday ?? 0)}
          change={formatChange(summary?.revenueTodayChangePercent)}
          positive={(summary?.revenueTodayChangePercent ?? 0) >= 0}
        />
        <StatCard
          label="Revenue This Month"
          value={summaryQuery.isLoading ? "..." : formatMoney(summary?.revenueThisMonth ?? 0)}
          change={formatChange(summary?.revenueThisMonthChangePercent)}
          positive={(summary?.revenueThisMonthChangePercent ?? 0) >= 0}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Reward Programs" value={rewardsQuery.isLoading ? "..." : activePrograms.toLocaleString()} change="Active" positive />
        <StatCard label="Pending Winners" value={rewardsQuery.isLoading ? "..." : pendingWinners.toLocaleString()} change="Review" positive={pendingWinners === 0} />
        <StatCard label="Paid Winners" value={rewardsQuery.isLoading ? "..." : paidWinners.toLocaleString()} change="Paid" positive />
        <StatCard label="Top Reward Score" value={rewardsQuery.isLoading ? "..." : (topCreator?.score ?? 0).toLocaleString()} change={topCreator ? `#1 ${topCreator.name}` : "No data"} positive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Panel title="User Growth (Last 30 days)">
          {summaryQuery.isLoading ? (
            <ChartLoading label="Loading user growth..." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#A0A0A0" tick={{ fontSize: 11 }} interval={4} />
              <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="users" stroke="#84CC16" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Revenue Trend">
          {summaryQuery.isLoading ? (
            <ChartLoading label="Loading revenue trend..." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
              <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(132,204,22,0.08)" }} />
              <Bar dataKey="revenue" fill="#84CC16" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <Panel title="Active Users (24h)" className="mb-6">
        {summaryQuery.isLoading ? (
          <ChartLoading label="Loading active users..." height={240} />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={activeUsersData}>
            <defs>
              <linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84CC16" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#84CC16" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="hour" stroke="#A0A0A0" tick={{ fontSize: 11 }} interval={3} />
            <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="active" stroke="#84CC16" strokeWidth={2} fill="url(#activeFill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="Rewards & Leaderboard Summary" className="mb-6">
        {rewardsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8 text-[#A0A0A0]">
            <Loader2 className="mr-2 size-5 animate-spin text-[#84CC16]" />
            Loading reward dashboard...
          </div>
        ) : rewardsQuery.isError ? (
          <p className="py-8 text-center text-red-400">Reward dashboard could not be loaded.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="size-5 text-[#84CC16]" />
                <h3 className="text-white">Top Creators</h3>
              </div>
              <div className="divide-y divide-white/5">
                {(rewardData?.leaderboard ?? []).slice(0, 5).map((creator) => (
                  <div key={creator.id} className="flex items-center gap-3 py-3">
                    <span className="w-8 text-sm text-[#84CC16]">#{creator.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{creator.name}</p>
                      <p className="text-xs text-[#A0A0A0]">{creator.followers.toLocaleString()} followers · {creator.engagement}% engagement</p>
                    </div>
                    <span className="text-sm text-[#84CC16]">{creator.score.toLocaleString()}</span>
                  </div>
                ))}
                {!rewardData?.leaderboard.length && (
                  <p className="py-6 text-center text-sm text-[#A0A0A0]">No leaderboard data yet.</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="size-5 text-[#84CC16]" />
                <h3 className="text-white">Recent Winners</h3>
              </div>
              <div className="divide-y divide-white/5">
                {(rewardData?.winners ?? []).slice(0, 5).map((winner) => (
                  <div key={winner.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{winner.winner || `Rank #${winner.rank}`}</p>
                      <p className="text-xs text-[#A0A0A0]">{winner.reward} · {winner.year}</p>
                    </div>
                    <StatusPill status={winner.status === "paid" ? "Paid" : winner.status === "approved" ? "Approved" : winner.status === "rejected" ? "Rejected" : "Pending"} />
                  </div>
                ))}
                {!rewardData?.winners.length && (
                  <p className="py-6 text-center text-sm text-[#A0A0A0]">No winners finalized yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Recent Activity">
        <div className="divide-y divide-white/5">
          {summaryQuery.isLoading ? (
            <div className="flex items-center justify-center py-8 text-[#A0A0A0]">
              <Loader2 className="mr-2 size-5 animate-spin text-[#84CC16]" />
              Loading recent activity...
            </div>
          ) : recentActivityData.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#A0A0A0]">No recent activity yet.</p>
          ) : recentActivityData.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-3">
              <div className="size-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                {activityIcon[a.type]}
              </div>
              <p className="text-sm text-white flex-1">{a.text}</p>
              <span className="text-xs text-[#A0A0A0] shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function formatChange(value = 0) {
  return `${Math.abs(value).toFixed(1)}%`;
}

function ChartLoading({ label, height = 260 }: { label: string; height?: number }) {
  return (
    <div className="flex items-center justify-center text-[#A0A0A0]" style={{ height }}>
      <Loader2 className="mr-2 size-5 animate-spin text-[#84CC16]" />
      {label}
    </div>
  );
}
