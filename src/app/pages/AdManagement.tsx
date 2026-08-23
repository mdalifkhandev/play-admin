import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ApproveButton, PageHeader, Panel, RejectButton, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { activeCampaigns, adRevenue, advertisers, campaignApprovals, formatMoney, formatNumber } from "../data";

const tooltipStyle = { backgroundColor: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" };

export function AdManagement() {
  return (
    <div>
      <PageHeader title="Ad Management" subtitle="Manage advertisers, campaigns and ad revenue" />
      <Tabs defaultValue="advertisers">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="approvals">Campaign Approvals</TabsTrigger>
          <TabsTrigger value="active">Active Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="advertisers" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Business Name</TableHead>
                  <TableHead className="text-[#A0A0A0]">Contact Email</TableHead>
                  <TableHead className="text-[#A0A0A0]">Total Spend</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisers.map((a, i) => (
                  <TableRow key={a.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{a.business}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{a.email}</TableCell>
                    <TableCell className="text-white">{formatMoney(a.spend)}</TableCell>
                    <TableCell><StatusPill status={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {campaignApprovals.map((c) => (
              <div key={c.id} className="rounded-xl bg-[#1A1A1A] border border-white/5 overflow-hidden">
                <div className="aspect-video">
                  <ImageWithFallback src={c.thumb} alt={c.name} className="size-full object-cover" />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-white">{c.name}</p>
                  <p className="text-sm text-[#A0A0A0]">Budget: <span className="text-white">{formatMoney(c.budget)}</span></p>
                  <p className="text-sm text-[#A0A0A0]">Audience: {c.audience}</p>
                  <div className="flex gap-2 pt-2">
                    <ApproveButton className="flex-1">Approve</ApproveButton>
                    <RejectButton className="flex-1">Reject</RejectButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Campaign</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                  <TableHead className="text-[#A0A0A0]">Impressions</TableHead>
                  <TableHead className="text-[#A0A0A0]">Clicks</TableHead>
                  <TableHead className="text-[#A0A0A0]">Spend</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCampaigns.map((c, i) => (
                  <TableRow key={c.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{c.name}</TableCell>
                    <TableCell><StatusPill status={c.status} /></TableCell>
                    <TableCell className="text-white">{formatNumber(c.impressions)}</TableCell>
                    <TableCell className="text-white">{formatNumber(c.clicks)}</TableCell>
                    <TableCell className="text-white">{formatMoney(c.spend)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent">
                          {c.status === "Active" ? "Pause" : "Resume"}
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/5 bg-transparent">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>
      </Tabs>

      <Panel title="Ad Revenue Report" className="mt-6">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={adRevenue}>
            <defs>
              <linearGradient id="adFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84CC16" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#84CC16" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="revenue" stroke="#84CC16" strokeWidth={2} fill="url(#adFill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
