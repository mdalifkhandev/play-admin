import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import {
  useReleasePendingCreatorEarningsMutation,
  useUpdateCreatorRequirementSettingsMutation,
  useMonetizationDashboardQuery,
} from "../api/monetization.query";
import type { CreatorRequirementSettings } from "../api/monetization";
import { handleApiError } from "../api/client";
import { PageHeader, Panel, StatCard, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { formatMoney } from "../data";

const COLORS = ["#84CC16", "#22c55e", "#3f3f46"];
const tooltipStyle = {
  backgroundColor: "#1A1A1A",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 8,
  color: "#FFFFFF",
};
const DEFAULT_REQUIREMENTS: CreatorRequirementSettings = {
  profileEnabled: true,
  followersEnabled: true,
  followers: 1000,
  viewsEnabled: true,
  views: 100000,
  watchTimeEnabled: false,
  watchTimeMinutes: 1000,
  likesEnabled: false,
  likes: 10000,
  accountAgeEnabled: true,
  accountAgeDays: 30,
  reelsEnabled: false,
  reels: 3,
  guidelinesEnabled: true,
  reportLimit: 0,
};

export function Monetization({ accessToken }: { accessToken: string }) {
  const query = useMonetizationDashboardQuery(accessToken);
  const updateRequirementsMutation = useUpdateCreatorRequirementSettingsMutation(accessToken);
  const releaseEarningsMutation = useReleasePendingCreatorEarningsMutation(accessToken);
  const dashboard = query.data;
  const [requirements, setRequirements] = useState<CreatorRequirementSettings>(DEFAULT_REQUIREMENTS);

  useEffect(() => {
    if (dashboard?.creatorRequirements) {
      setRequirements({ ...DEFAULT_REQUIREMENTS, ...dashboard.creatorRequirements });
    }
  }, [dashboard?.creatorRequirements]);

  const saveRequirements = () => {
    updateRequirementsMutation
      .mutateAsync(requirements)
      .then(() => toast.success("Creator requirement settings saved."))
      .catch((error) => toast.error(handleApiError(error, "Failed to save creator requirements.")));
  };

  const releasePendingEarnings = () => {
    releaseEarningsMutation
      .mutateAsync()
      .then((result) => toast.success(`Released ${result.released} pending earning${result.released === 1 ? "" : "s"}.`))
      .catch((error) => toast.error(handleApiError(error, "Failed to release pending earnings.")));
  };

  if (query.isLoading) {
    return (
      <div>
        <PageHeader title="Monetization & Revenue" subtitle="Track revenue streams and manage payouts" />
        <Panel>
          <div className="flex items-center justify-center gap-2 py-12 text-[#A0A0A0]">
            <Loader2 className="size-4 animate-spin text-[#84CC16]" />
            Loading monetization data...
          </div>
        </Panel>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div>
        <PageHeader title="Monetization & Revenue" subtitle="Track revenue streams and manage payouts" />
        <Panel>
          <div className="py-12 text-center text-[#A0A0A0]">Monetization data could not be loaded.</div>
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Monetization & Revenue" subtitle="Track revenue streams and manage payouts" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={formatMoney(dashboard.summary.totalRevenue)} />
        <StatCard label="Ad Revenue" value={formatMoney(dashboard.summary.adRevenue)} />
        <StatCard label="Coin Revenue" value={formatMoney(dashboard.summary.coinRevenue)} />
        <StatCard label="Pending Payouts" value={formatMoney(dashboard.summary.pendingPayouts)} positive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Panel title="Revenue Breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dashboard.revenueBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} isAnimationActive={false}>
                {dashboard.revenueBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: "#FFFFFF" }}
                labelStyle={{ color: "#FFFFFF" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {dashboard.revenueBreakdown.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#A0A0A0]">
                  <span className="size-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {s.name}
                </span>
                <span className="text-white">{s.value}% · {formatMoney(s.amount)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Creator Earnings Overview" className="lg:col-span-2">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                <TableHead className="text-[#A0A0A0]">Total Earnings</TableHead>
                <TableHead className="text-[#A0A0A0]">This Month</TableHead>
                <TableHead className="text-[#A0A0A0]">Payout Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.creatorEarnings.length === 0 && (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={4} className="py-8 text-center text-[#A0A0A0]">
                    No creator earnings yet.
                  </TableCell>
                </TableRow>
              )}
              {dashboard.creatorEarnings.map((c, i) => (
                <TableRow key={c.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                  <TableCell className="text-white">{c.name}</TableCell>
                  <TableCell className="text-white">{formatMoney(c.total)}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{formatMoney(c.thisMonth)}</TableCell>
                  <TableCell><StatusPill status={c.payout} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </div>

      <Panel
        title="Creator Eligibility Requirements"
        action={
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-transparent text-[#A0A0A0] hover:bg-white/5"
            disabled={releaseEarningsMutation.isPending}
            onClick={releasePendingEarnings}
          >
            {releaseEarningsMutation.isPending ? <><Loader2 className="size-4 animate-spin" /> Releasing...</> : "Release Pending"}
          </Button>
        }
        className="mt-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <RequirementToggleField
            label="Profile complete"
            enabled={requirements.profileEnabled}
            onEnabledChange={(enabled) => setRequirements((current) => ({ ...current, profileEnabled: enabled }))}
          />
          <RequirementField
            label="Followers required"
            enabled={requirements.followersEnabled}
            value={requirements.followers}
            onEnabledChange={(enabled) => setRequirements((current) => ({ ...current, followersEnabled: enabled }))}
            onChange={(value) => setRequirements((current) => ({ ...current, followers: value }))}
          />
          <RequirementField
            label="Video views required"
            enabled={requirements.viewsEnabled}
            value={requirements.views}
            onEnabledChange={(enabled) => setRequirements((current) => ({ ...current, viewsEnabled: enabled }))}
            onChange={(value) => setRequirements((current) => ({ ...current, views: value }))}
          />
          <RequirementField
            label="Watch time minutes"
            enabled={requirements.watchTimeEnabled}
            value={requirements.watchTimeMinutes}
            onEnabledChange={(enabled) => setRequirements((current) => ({ ...current, watchTimeEnabled: enabled }))}
            onChange={(value) => setRequirements((current) => ({ ...current, watchTimeMinutes: value }))}
          />
          <RequirementField
            label="Likes required"
            enabled={requirements.likesEnabled}
            value={requirements.likes}
            onEnabledChange={(enabled) => setRequirements((current) => ({ ...current, likesEnabled: enabled }))}
            onChange={(value) => setRequirements((current) => ({ ...current, likes: value }))}
          />
          <RequirementField
            label="Account age days"
            enabled={requirements.accountAgeEnabled}
            value={requirements.accountAgeDays}
            onEnabledChange={(enabled) => setRequirements((current) => ({ ...current, accountAgeEnabled: enabled }))}
            onChange={(value) => setRequirements((current) => ({ ...current, accountAgeDays: value }))}
          />
          <RequirementField
            label="Minimum reels"
            enabled={requirements.reelsEnabled}
            value={requirements.reels}
            onEnabledChange={(enabled) => setRequirements((current) => ({ ...current, reelsEnabled: enabled }))}
            onChange={(value) => setRequirements((current) => ({ ...current, reels: value }))}
          />
          <RequirementField
            label="Allowed reports"
            enabled={requirements.guidelinesEnabled}
            value={requirements.reportLimit}
            onEnabledChange={(enabled) => setRequirements((current) => ({ ...current, guidelinesEnabled: enabled }))}
            onChange={(value) => setRequirements((current) => ({ ...current, reportLimit: value }))}
          />
        </div>
        <p className="mt-4 text-xs text-[#A0A0A0]">
          Toggle a milestone on when it must be completed before applying. Disabled milestones stay saved here but are not required in the mobile app.
        </p>
        <div className="mt-6">
          <Button
            className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
            disabled={updateRequirementsMutation.isPending}
            onClick={saveRequirements}
          >
            {updateRequirementsMutation.isPending ? "Saving..." : "Save Requirements"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function RequirementToggleField({
  label,
  enabled,
  onEnabledChange,
}: {
  label: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#141414] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label className="text-xs text-[#A0A0A0]">{label}</label>
          <p className="mt-1 text-[11px] text-[#666]">No value needed</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          className="data-[state=checked]:bg-[#84CC16] data-[state=unchecked]:bg-[#2A2A2A]"
        />
      </div>
    </div>
  );
}

function RequirementField({
  label,
  enabled,
  value,
  onEnabledChange,
  onChange,
}: {
  label: string;
  enabled: boolean;
  value: number;
  onEnabledChange: (enabled: boolean) => void;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-[#A0A0A0]">{label}</label>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          className="data-[state=checked]:bg-[#84CC16] data-[state=unchecked]:bg-[#2A2A2A]"
        />
      </div>
      <Input
        type="number"
        min={0}
        value={value}
        disabled={!enabled}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        className="mt-2 bg-[#141414] border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
