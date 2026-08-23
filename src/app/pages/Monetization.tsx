import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { creatorEarnings, formatMoney, revenueSplit } from "../data";

const COLORS = ["#84CC16", "#3f3f46"];
const tooltipStyle = { backgroundColor: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" };

export function Monetization() {
  const [creatorShare, setCreatorShare] = useState(60);

  return (
    <div>
      <PageHeader title="Monetization & Revenue" subtitle="Track revenue streams and manage payouts" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Panel title="Revenue Breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={revenueSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} isAnimationActive={false}>
                {revenueSplit.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {revenueSplit.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#A0A0A0]">
                  <span className="size-3 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                  {s.name}
                </span>
                <span className="text-white">{s.value}%</span>
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
              {creatorEarnings.map((c, i) => (
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

      <Panel title="Revenue Share Settings">
        <div className="max-w-xl">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-[#84CC16]">Creator: {creatorShare}%</span>
            <span className="text-[#A0A0A0]">Admin: {100 - creatorShare}%</span>
          </div>
          <Slider value={[creatorShare]} onValueChange={(v) => setCreatorShare(v[0])} min={0} max={100} step={5} />
          <div className="mt-6">
            <Button className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90">Save Changes</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
