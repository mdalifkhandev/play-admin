import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { handleApiError } from "../api/client";
import {
  useAdminRewardDashboardQuery,
  useCreateAdminRewardProgramMutation,
  useFinalizeAdminRewardWinnersMutation,
  useUpdateAdminRewardProgramMutation,
  useUpdateAdminRewardSettingsMutation,
  useUpdateAdminRewardWinnerStatusMutation,
} from "../api/rewards.query";
import type { AdminRewardProgram, AdminRewardProgramInput } from "../api/rewards";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { formatNumber } from "../data";

type RewardsProps = {
  accessToken: string;
};

type RewardProgramCard = AdminRewardProgram | AdminRewardProgramInput;

const defaultPrograms: AdminRewardProgramInput[] = [
  {
    name: "Vehicle Giveaway",
    reward: "Vehicle Giveaway",
    eligibilityCriteria: "Top creator by reward score",
    cycle: "yearly",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Scholarship Fund",
    reward: "Scholarship Fund",
    eligibilityCriteria: "Age 16-22, 500K+ followers",
    cycle: "yearly",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Cash / Fund Support",
    reward: "Cash / Fund Support",
    eligibilityCriteria: "Top 100 by engagement score",
    cycle: "monthly",
    isActive: true,
    sortOrder: 3,
  },
];

export function Rewards({ accessToken }: RewardsProps) {
  const dashboardQuery = useAdminRewardDashboardQuery(accessToken);
  const updateSettingsMutation = useUpdateAdminRewardSettingsMutation(accessToken);
  const createProgramMutation = useCreateAdminRewardProgramMutation(accessToken);
  const updateProgramMutation = useUpdateAdminRewardProgramMutation(accessToken);
  const finalizeWinnersMutation = useFinalizeAdminRewardWinnersMutation(accessToken);
  const updateWinnerStatusMutation = useUpdateAdminRewardWinnerStatusMutation(accessToken);

  const [followerW, setFollowerW] = useState(40);
  const [likeW, setLikeW] = useState(35);
  const [engageW, setEngageW] = useState(25);

  const programs = useMemo(() => {
    const existing = dashboardQuery.data?.programs ?? [];
    return defaultPrograms.map((fallback, index) => existing[index] ?? fallback) as RewardProgramCard[];
  }, [dashboardQuery.data?.programs]);

  useEffect(() => {
    const settings = dashboardQuery.data?.settings;
    if (!settings) return;
    setFollowerW(settings.followersWeight);
    setLikeW(settings.likesWeight);
    setEngageW(settings.commentsWeight);
  }, [dashboardQuery.data?.settings]);

  const saveSettings = async () => {
    const settings = dashboardQuery.data?.settings;
    if (!settings) return;

    try {
      await updateSettingsMutation.mutateAsync({
        ...settings,
        followersWeight: followerW,
        likesWeight: likeW,
        commentsWeight: engageW,
        sharesWeight: engageW,
      });
      toast.success("Reward settings saved.");
    } catch (error) {
      toast.error(handleApiError(error, "Failed to save reward settings."));
    }
  };

  const saveProgram = async (
    program: RewardProgramCard,
    input: Partial<AdminRewardProgramInput>,
  ) => {
    try {
      if ("id" in program) {
        await updateProgramMutation.mutateAsync({ programId: program.id, input });
      } else {
        await createProgramMutation.mutateAsync({ ...program, ...input });
      }
      toast.success("Reward program updated.");
    } catch (error) {
      toast.error(handleApiError(error, "Failed to update reward program."));
    }
  };

  const finalizeWinners = async () => {
    const firstActiveProgram = dashboardQuery.data?.programs.find((program) => program.isActive);

    try {
      await finalizeWinnersMutation.mutateAsync({
        programId: firstActiveProgram?.id,
        limit: dashboardQuery.data?.settings.leaderboardLimit ?? 10,
        cycleLabel: String(new Date().getFullYear()),
      });
      toast.success("Current cycle winners finalized.");
    } catch (error) {
      toast.error(handleApiError(error, "Failed to finalize winners."));
    }
  };

  const updateWinnerStatus = async (winnerId: string, status: "approved" | "rejected" | "paid") => {
    try {
      await updateWinnerStatusMutation.mutateAsync({ winnerId, status });
      toast.success("Winner status updated.");
    } catch (error) {
      toast.error(handleApiError(error, "Failed to update winner status."));
    }
  };

  const loading = dashboardQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader title="Rewards & Leaderboard" subtitle="Rank creators and configure reward programs" />

      <Panel title="Leaderboard Overview">
        {loading ? (
          <LoadingState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[#A0A0A0]">Rank</TableHead>
                <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                <TableHead className="text-[#A0A0A0]">Followers</TableHead>
                <TableHead className="text-[#A0A0A0]">Likes</TableHead>
                <TableHead className="text-[#A0A0A0]">Engagement</TableHead>
                <TableHead className="text-[#A0A0A0]">Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(dashboardQuery.data?.leaderboard ?? []).map((r) => (
                <TableRow
                  key={r.id}
                  className={`border-white/5 hover:bg-white/5 border-l-2 ${r.rank <= 10 ? "border-l-[#84CC16] bg-[#84CC16]/[0.04]" : "border-l-transparent"}`}
                >
                  <TableCell className="text-white">#{r.rank}</TableCell>
                  <TableCell className="text-white">{r.name}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{formatNumber(r.followers)}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{formatNumber(r.likes)}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{r.engagement}%</TableCell>
                  <TableCell className="text-[#84CC16]">{r.score.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {!dashboardQuery.data?.leaderboard.length && (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={6} className="py-8 text-center text-[#A0A0A0]">
                    No leaderboard data yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Panel>

      <Panel title="Ranking Criteria Settings">
        <div className="max-w-xl space-y-6">
          {[
            { l: "Followers", v: followerW, s: setFollowerW },
            { l: "Likes", v: likeW, s: setLikeW },
            { l: "Engagement", v: engageW, s: setEngageW },
          ].map((c) => (
            <div key={c.l}>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-white">{c.l}</span>
                <span className="text-[#84CC16]">{c.v}%</span>
              </div>
              <Slider value={[c.v]} onValueChange={(val) => c.s(val[0])} min={0} max={100} step={5} />
            </div>
          ))}
          <Button
            className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
            disabled={updateSettingsMutation.isPending || loading}
            onClick={saveSettings}
          >
            {updateSettingsMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Save Settings
          </Button>
        </div>
      </Panel>

      <Panel title="Reward Configuration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programs.map((program) => (
            <div key={"id" in program ? program.id : program.name} className="rounded-lg bg-white/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white">{program.name}</p>
                <Switch
                  checked={program.isActive}
                  disabled={updateProgramMutation.isPending || createProgramMutation.isPending}
                  onCheckedChange={(isActive) => void saveProgram(program, { isActive })}
                />
              </div>
              <p className="text-sm text-[#A0A0A0]">Cycle: {program.cycle.charAt(0).toUpperCase() + program.cycle.slice(1)}</p>
              {"id" in program ? (
                <Input
                  defaultValue={program.eligibilityCriteria}
                  onBlur={(event) => {
                    const nextValue = event.currentTarget.value.trim();
                    if (nextValue && nextValue !== program.eligibilityCriteria) {
                      void saveProgram(program, { eligibilityCriteria: nextValue });
                    }
                  }}
                  className="bg-[#141414] border-white/10 text-white"
                />
              ) : (
                <StatusPill status={program.isActive ? "Active" : "Cancelled"} />
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Winner Management"
        action={
          <Button
            className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
            disabled={finalizeWinnersMutation.isPending || loading}
            onClick={finalizeWinners}
          >
            {finalizeWinnersMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Finalize Current Cycle Winners
          </Button>
        }
      >
        {loading ? (
          <LoadingState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[#A0A0A0]">Year</TableHead>
                <TableHead className="text-[#A0A0A0]">Winner</TableHead>
                <TableHead className="text-[#A0A0A0]">Reward</TableHead>
                <TableHead className="text-[#A0A0A0]">Status</TableHead>
                <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(dashboardQuery.data?.winners ?? []).map((w, i) => (
                <TableRow key={w.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                  <TableCell className="text-white">{w.year}</TableCell>
                  <TableCell className="text-white">{w.winner || `Rank #${w.rank}`}</TableCell>
                  <TableCell className="text-[#84CC16]">{w.reward}</TableCell>
                  <TableCell>
                    <StatusPill status={w.status === "paid" ? "Active" : w.status === "rejected" ? "Rejected" : w.status === "approved" ? "Approved" : "Pending"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={w.status === "approved" || updateWinnerStatusMutation.isPending}
                        onClick={() => void updateWinnerStatus(w.id, "approved")}
                        className="border-[#84CC16]/40 text-[#84CC16] hover:bg-[#84CC16]/10"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={w.status === "rejected" || updateWinnerStatusMutation.isPending}
                        onClick={() => void updateWinnerStatus(w.id, "rejected")}
                        className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={w.status === "paid" || updateWinnerStatusMutation.isPending}
                        onClick={() => void updateWinnerStatus(w.id, "paid")}
                        className="border-white/10 text-white hover:bg-white/10"
                      >
                        Paid
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!dashboardQuery.data?.winners.length && (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                    No winners finalized yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-10 text-[#A0A0A0]">
      <Loader2 className="mr-2 size-5 animate-spin text-[#84CC16]" />
      Loading rewards data...
    </div>
  );
}
