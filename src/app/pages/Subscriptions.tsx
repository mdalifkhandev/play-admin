import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, StatCard, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { subscribers, subscriptionRevenue } from "../data";

const tooltipStyle = { backgroundColor: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" };

export function Subscriptions() {
  const [monthlyPrice, setMonthlyPrice] = useState("9.99");
  const [yearlyPrice, setYearlyPrice] = useState("95.90");
  const [discount, setDiscount] = useState("20");

  return (
    <div>
      <PageHeader title="Subscription Management" subtitle="Monitor premium subscribers and revenue" />

      <Panel title="Package Configuration" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Monthly Price</Label>
            <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3">
              <span className="text-[#A0A0A0] mr-1">$</span>
              <input
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                inputMode="decimal"
                className="bg-transparent outline-none text-white w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Yearly Price</Label>
            <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3">
              <span className="text-[#A0A0A0] mr-1">$</span>
              <input
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value)}
                inputMode="decimal"
                className="bg-transparent outline-none text-white w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Yearly Discount</Label>
            <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3">
              <input
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                inputMode="numeric"
                className="bg-transparent outline-none text-white w-full"
              />
              <span className="text-[#A0A0A0] ml-1">%</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Button
            className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90"
            onClick={() => toast.success("Package pricing updated")}
          >
            Save Changes
          </Button>
        </div>
      </Panel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Premium Subscribers" value="184.2K" change="9.6%" positive />
        <StatCard label="Monthly Subscribers" value="128.4K" change="5.1%" positive />
        <StatCard label="Yearly Subscribers" value="55.8K" change="12.8%" positive />
      </div>

      <Panel title="Subscription Revenue Trend" className="mb-6">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={subscriptionRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="revenue" stroke="#84CC16" strokeWidth={2.5} dot={{ fill: "#84CC16", r: 3 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Subscribers">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#A0A0A0]">Username</TableHead>
              <TableHead className="text-[#A0A0A0]">Plan Type</TableHead>
              <TableHead className="text-[#A0A0A0]">Start Date</TableHead>
              <TableHead className="text-[#A0A0A0]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((s, i) => (
              <TableRow key={s.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                <TableCell className="text-white">{s.username}</TableCell>
                <TableCell className="text-[#A0A0A0]">{s.plan}</TableCell>
                <TableCell className="text-[#A0A0A0]">{s.start}</TableCell>
                <TableCell><StatusPill status={s.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
