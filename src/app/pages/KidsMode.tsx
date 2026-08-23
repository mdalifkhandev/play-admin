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
import { PageHeader, Panel, RejectButton, StatCard } from "../components/shared";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { kidsAgeBreakdown, kidsReportedContent, kidsTaggedContent } from "../data";

const tooltipStyle = { backgroundColor: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" };

function Thumb({ src }: { src: string }) {
  return (
    <div className="w-20 aspect-video rounded-md overflow-hidden bg-black/40">
      <ImageWithFallback src={src} alt="Video thumbnail" className="size-full object-cover" />
    </div>
  );
}

export function KidsMode() {
  const [tags, setTags] = useState<Record<string, boolean>>(
    Object.fromEntries(kidsTaggedContent.map((c) => [c.id, c.tagged])),
  );

  return (
    <div>
      <PageHeader title="Kids Mode Management" subtitle="Review and moderate kid-friendly content" />
      <Tabs defaultValue="tagged">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="tagged">Tagged Content</TabsTrigger>
          <TabsTrigger value="reported">Reported Content</TabsTrigger>
          <TabsTrigger value="stats">Usage Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="tagged" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Thumbnail</TableHead>
                  <TableHead className="text-[#A0A0A0]">Uploader</TableHead>
                  <TableHead className="text-[#A0A0A0]">Upload Date</TableHead>
                  <TableHead className="text-[#A0A0A0]">Kid-Friendly</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kidsTaggedContent.map((c, i) => (
                  <TableRow key={c.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell><Thumb src={c.thumb} /></TableCell>
                    <TableCell className="text-white">{c.uploader}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{c.date}</TableCell>
                    <TableCell>
                      <Switch
                        checked={tags[c.id]}
                        onCheckedChange={(v) => setTags((t) => ({ ...t, [c.id]: v }))}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <RejectButton onClick={() => setTags((t) => ({ ...t, [c.id]: false }))}>Remove Tag</RejectButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="reported" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Thumbnail</TableHead>
                  <TableHead className="text-[#A0A0A0]">Reporter Count</TableHead>
                  <TableHead className="text-[#A0A0A0]">Report Reason</TableHead>
                  <TableHead className="text-[#A0A0A0]">Date Reported</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kidsReportedContent.map((c, i) => (
                  <TableRow key={c.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell><Thumb src={c.thumb} /></TableCell>
                    <TableCell className="text-white">{c.reports}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{c.reason}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{c.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" className="bg-red-500 text-white hover:bg-red-500/90">Remove from Kids Feed</Button>
                        <Button size="sm" variant="outline" className="border-white/15 text-[#A0A0A0] hover:bg-white/5 bg-transparent">Dismiss Report</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="stats" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="Total Kids Mode Users" value="106.3K" change="7.9%" positive />
            <StatCard label="Active Kids Profiles" value="82.5K" change="4.3%" positive />
          </div>
          <Panel title="Users by Age Range">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kidsAgeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="range" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
                <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(132,204,22,0.08)" }} />
                <Bar dataKey="users" fill="#84CC16" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
