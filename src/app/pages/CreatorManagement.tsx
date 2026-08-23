import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { ApproveButton, PageHeader, Panel, RejectButton, StatCard, StatusPill } from "../components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  ActiveCreator,
  activeCreators,
  creatorEarningsGraph,
  formatMoney,
  formatNumber,
  pendingCreators,
} from "../data";

const tooltipStyle = { backgroundColor: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" };

function Performance({ creator, onBack }: { creator: ActiveCreator; onBack: () => void }) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="text-[#A0A0A0] hover:text-white mb-4 -ml-2">
        <ArrowLeft className="size-4" /> Back to creators
      </Button>
      <PageHeader title={`${creator.name} — Performance`} subtitle="Individual creator analytics" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Earnings" value={formatMoney(creator.earnings)} change="6.4%" positive />
        <StatCard label="Followers" value={formatNumber(creator.followers)} change="4.1%" positive />
        <StatCard label="Engagement Rate" value="8.9%" change="1.2%" positive />
      </div>
      <Panel title="Earnings Over Time">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={creatorEarningsGraph}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(132,204,22,0.08)" }} />
            <Bar dataKey="earnings" fill="#84CC16" radius={[6, 6, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

export function CreatorManagement() {
  const [perf, setPerf] = useState<ActiveCreator | null>(null);

  if (perf) return <Performance creator={perf} onBack={() => setPerf(null)} />;

  return (
    <div>
      <PageHeader title="Creator Management" subtitle="Review applications and manage active creators" />
      <Tabs defaultValue="pending">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="pending">Pending Applications</TabsTrigger>
          <TabsTrigger value="active">Active Creators</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                  <TableHead className="text-[#A0A0A0]">Category</TableHead>
                  <TableHead className="text-[#A0A0A0]">Followers</TableHead>
                  <TableHead className="text-[#A0A0A0]">Applied</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingCreators.map((c, i) => (
                  <TableRow key={c.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8"><AvatarImage src={c.avatar} /><AvatarFallback>C</AvatarFallback></Avatar>
                        <span className="text-white">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#A0A0A0]">{c.category}</TableCell>
                    <TableCell className="text-white">{formatNumber(c.followers)}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{c.applied}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ApproveButton>Approve</ApproveButton>
                        <RejectButton>Reject</RejectButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                  <TableHead className="text-[#A0A0A0]">Followers</TableHead>
                  <TableHead className="text-[#A0A0A0]">Total Earnings</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCreators.map((c, i) => (
                  <TableRow key={c.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8"><AvatarImage src={c.avatar} /><AvatarFallback>C</AvatarFallback></Avatar>
                        <span className="text-white">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{formatNumber(c.followers)}</TableCell>
                    <TableCell className="text-white">{formatMoney(c.earnings)}</TableCell>
                    <TableCell><StatusPill status={c.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/5 bg-transparent" onClick={() => setPerf(c)}>
                          View Performance
                        </Button>
                        <RejectButton>Revoke</RejectButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
