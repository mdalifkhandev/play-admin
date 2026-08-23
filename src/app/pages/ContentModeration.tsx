import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { reportedVideos, violationLog } from "../data";

const reportedComments = [
  { id: "rc1", user: "@troll_99", comment: "This is spam, buy followers here...", reason: "Spam", reports: 12 },
  { id: "rc2", user: "@angry.viewer", comment: "Hateful language directed at creator", reason: "Hate speech", reports: 7 },
  { id: "rc3", user: "@bot_army", comment: "Repeated promotional links", reason: "Spam", reports: 21 },
];

export function ContentModeration() {
  return (
    <div>
      <PageHeader title="Content Moderation" subtitle="Review reported content and enforce guidelines" />
      <Tabs defaultValue="videos">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="videos">Reported Videos</TabsTrigger>
          <TabsTrigger value="comments">Reported Comments</TabsTrigger>
          <TabsTrigger value="log">Violation Log</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {reportedVideos.map((v) => (
              <div key={v.id} className="rounded-xl bg-[#1A1A1A] border border-white/5 overflow-hidden">
                <div className="relative aspect-video">
                  <ImageWithFallback src={v.thumb} alt={v.reason} className="size-full object-cover" />
                  <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">{v.reports} reports</Badge>
                  <Badge className="absolute top-2 left-2 bg-black/60 text-white border-0 backdrop-blur">{v.reason}</Badge>
                </div>
                <div className="p-4">
                  <p className="text-white text-sm mb-3">{v.creator}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-red-500 text-white hover:bg-red-500/90 flex-1">Remove</Button>
                    <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent flex-1">Warn</Button>
                    <Button size="sm" variant="outline" className="border-white/15 text-[#A0A0A0] hover:bg-white/5 bg-transparent flex-1">Ignore</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">User</TableHead>
                  <TableHead className="text-[#A0A0A0]">Comment</TableHead>
                  <TableHead className="text-[#A0A0A0]">Reason</TableHead>
                  <TableHead className="text-[#A0A0A0]">Reports</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportedComments.map((c, i) => (
                  <TableRow key={c.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{c.user}</TableCell>
                    <TableCell className="text-[#A0A0A0] max-w-xs truncate">{c.comment}</TableCell>
                    <TableCell><Badge variant="outline" className="border-red-500/30 text-red-400">{c.reason}</Badge></TableCell>
                    <TableCell className="text-white">{c.reports}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" className="bg-red-500 text-white hover:bg-red-500/90">Delete</Button>
                        <Button size="sm" variant="outline" className="border-white/15 text-[#A0A0A0] hover:bg-white/5 bg-transparent">Ignore</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">User</TableHead>
                  <TableHead className="text-[#A0A0A0]">Violation Type</TableHead>
                  <TableHead className="text-[#A0A0A0]">Date</TableHead>
                  <TableHead className="text-[#A0A0A0]">Action Taken</TableHead>
                  <TableHead className="text-[#A0A0A0]">Strikes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violationLog.map((v, i) => (
                  <TableRow key={v.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{v.user}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{v.type}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{v.date}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{v.action}</TableCell>
                    <TableCell>
                      <StatusPill status={v.strikes >= 3 ? "Banned" : v.strikes >= 1 ? "Warned" : "Active"} />
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
