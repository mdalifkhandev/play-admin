import { useState } from "react";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { formatNumber, leaderboard, winners } from "../data";

export function Rewards() {
  const [followerW, setFollowerW] = useState(40);
  const [likeW, setLikeW] = useState(35);
  const [engageW, setEngageW] = useState(25);
  const [vehicleActive, setVehicleActive] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Rewards & Leaderboard" subtitle="Rank creators and configure reward programs" />

      <Panel title="Leaderboard Overview">
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
            {leaderboard.map((r) => (
              <TableRow
                key={r.rank}
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
          </TableBody>
        </Table>
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
          <Button className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90">Save Settings</Button>
        </div>
      </Panel>

      <Panel title="Reward Configuration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white">Vehicle Giveaway</p>
              <Switch checked={vehicleActive} onCheckedChange={setVehicleActive} />
            </div>
            <p className="text-sm text-[#A0A0A0]">Cycle: Yearly</p>
            <StatusPill status={vehicleActive ? "Active" : "Cancelled"} />
          </div>
          <div className="rounded-lg bg-white/5 p-4 space-y-3">
            <p className="text-white">Scholarship Fund</p>
            <label className="text-xs text-[#A0A0A0]">Eligibility criteria</label>
            <Input defaultValue="Age 16-22, 500K+ followers" className="bg-[#141414] border-white/10 text-white" />
          </div>
          <div className="rounded-lg bg-white/5 p-4 space-y-3">
            <p className="text-white">Cash / Fund Support</p>
            <label className="text-xs text-[#A0A0A0]">Eligibility criteria</label>
            <Input defaultValue="Top 100 by engagement score" className="bg-[#141414] border-white/10 text-white" />
          </div>
        </div>
      </Panel>

      <Panel
        title="Winner Management"
        action={<Button className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90">Finalize Current Cycle Winners</Button>}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#A0A0A0]">Year</TableHead>
              <TableHead className="text-[#A0A0A0]">Winner</TableHead>
              <TableHead className="text-[#A0A0A0]">Reward</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {winners.map((w, i) => (
              <TableRow key={w.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                <TableCell className="text-white">{w.year}</TableCell>
                <TableCell className="text-white">{w.name}</TableCell>
                <TableCell className="text-[#84CC16]">{w.reward}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
