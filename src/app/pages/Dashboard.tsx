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
import { UserPlus, Clock, Flag } from "lucide-react";
import { PageHeader, Panel, StatCard } from "../components/shared";
import {
  activeUsers,
  recentActivity,
  revenueTrend,
  userGrowth,
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

export function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform overview and key metrics at a glance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value="2.84M" change="12.4%" positive />
        <StatCard label="Total Creators" value="48.2K" change="8.1%" positive />
        <StatCard label="Revenue Today" value="$18.9K" change="3.2%" positive />
        <StatCard label="Revenue This Month" value="$482K" change="2.4%" positive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Panel title="User Growth (Last 30 days)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#A0A0A0" tick={{ fontSize: 11 }} interval={4} />
              <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="users" stroke="#84CC16" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Revenue Trend">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
              <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(132,204,22,0.08)" }} />
              <Bar dataKey="revenue" fill="#84CC16" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Active Users (24h)" className="mb-6">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={activeUsers}>
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
      </Panel>

      <Panel title="Recent Activity">
        <div className="divide-y divide-white/5">
          {recentActivity.map((a) => (
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
