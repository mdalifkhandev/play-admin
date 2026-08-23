import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { pastAnnouncements } from "../data";

export function Notifications() {
  const [schedule, setSchedule] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications & Announcements" subtitle="Broadcast messages to your community" />

      <Panel title="Create New Announcement">
        <div className="max-w-2xl space-y-4">
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Title</Label>
            <Input placeholder="Announcement title" className="bg-[#141414] border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Message</Label>
            <Textarea rows={4} placeholder="Write your message..." className="bg-[#141414] border-white/10 text-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Target Audience</Label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-[#141414] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="creators">Creators Only</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Delivery</Label>
              <div className="flex items-center gap-3 h-9">
                <span className={`text-sm ${!schedule ? "text-white" : "text-[#A0A0A0]"}`}>Send Now</span>
                <Switch checked={schedule} onCheckedChange={setSchedule} />
                <span className={`text-sm ${schedule ? "text-white" : "text-[#A0A0A0]"}`}>Schedule</span>
              </div>
            </div>
          </div>
          {schedule && (
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Schedule for</Label>
              <Input type="datetime-local" className="bg-[#141414] border-white/10 text-white w-full sm:w-64" />
            </div>
          )}
          <Button
            className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
            onClick={() => toast.success(schedule ? "Announcement scheduled" : "Announcement sent")}
          >
            Send Announcement
          </Button>
        </div>
      </Panel>

      <Panel title="Past Announcements">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#A0A0A0]">Title</TableHead>
              <TableHead className="text-[#A0A0A0]">Sent Date</TableHead>
              <TableHead className="text-[#A0A0A0]">Audience</TableHead>
              <TableHead className="text-[#A0A0A0]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pastAnnouncements.map((a, i) => (
              <TableRow key={a.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                <TableCell className="text-white">{a.title}</TableCell>
                <TableCell className="text-[#A0A0A0]">{a.date}</TableCell>
                <TableCell className="text-[#A0A0A0]">{a.audience}</TableCell>
                <TableCell><StatusPill status={a.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
