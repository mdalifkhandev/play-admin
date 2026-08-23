import { Eye } from "lucide-react";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { formatNumber, ongoingStreams, reportedStreams, streamHistory } from "../data";

export function LiveManagement() {
  return (
    <div>
      <PageHeader title="Live Management" subtitle="Monitor and moderate live streams" />
      <Tabs defaultValue="ongoing">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="ongoing">Ongoing Streams</TabsTrigger>
          <TabsTrigger value="reported">Reported Streams</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {ongoingStreams.map((s) => (
              <div key={s.id} className="rounded-xl bg-[#1A1A1A] border border-white/5 overflow-hidden">
                <div className="relative aspect-video">
                  <ImageWithFallback src={s.thumb} alt={s.creator} className="size-full object-cover" />
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-md">
                    <span className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE
                  </span>
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-black/60 backdrop-blur text-white text-xs px-2 py-0.5 rounded-md">
                    <Eye className="size-3" /> {formatNumber(s.viewers)}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-white text-sm mb-3">{s.creator}</p>
                  <Button size="sm" className="w-full bg-red-500 text-white hover:bg-red-500/90">Force End</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reported" className="mt-4">
          <Panel>
            <div className="divide-y divide-white/5">
              {reportedStreams.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-white">{r.creator}</p>
                    <p className="text-sm text-[#A0A0A0]">{r.reason} · {r.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-red-500 text-white hover:bg-red-500/90">Force End</Button>
                    <Button size="sm" variant="outline" className="border-white/15 text-[#A0A0A0] hover:bg-white/5 bg-transparent">Dismiss</Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                  <TableHead className="text-[#A0A0A0]">Date</TableHead>
                  <TableHead className="text-[#A0A0A0]">Duration</TableHead>
                  <TableHead className="text-[#A0A0A0]">Peak Viewers</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streamHistory.map((h, i) => (
                  <TableRow key={h.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{h.creator}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{h.date}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{h.duration}</TableCell>
                    <TableCell className="text-white">{formatNumber(h.peak)}</TableCell>
                    <TableCell><StatusPill status={h.status} /></TableCell>
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
