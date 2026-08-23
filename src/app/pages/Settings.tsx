import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Panel } from "../components/shared";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { adminTeam, languages } from "../data";

function Field({ label, defaultValue, suffix }: { label: string; defaultValue: string; suffix?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-[#A0A0A0]">{label}</Label>
      <div className="flex items-center gap-2">
        <Input defaultValue={defaultValue} className="bg-[#141414] border-white/10 text-white" />
        {suffix && <span className="text-sm text-[#A0A0A0] whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}

const payoutRates = [
  { region: "North America", rate: "$4.20" },
  { region: "Europe", rate: "$3.80" },
  { region: "Asia Pacific", rate: "$2.10" },
  { region: "Latin America", rate: "$1.60" },
];

export function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings & Configuration" subtitle="Manage platform-wide rules and access" />

      <Panel title="Milestone Thresholds">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <Field label="Follower Count" defaultValue="10000" />
          <Field label="View Count" defaultValue="500000" />
          <Field label="Account Age" defaultValue="90" suffix="days" />
        </div>
      </Panel>

      <Panel title="Ad Frequency">
        <div className="max-w-xs">
          <Field label="Videos between ads" defaultValue="6" suffix="videos" />
        </div>
      </Panel>

      <Panel title="Payout Rate">
        <div className="max-w-xs mb-6">
          <Field label="Per 1,000 views" defaultValue="3.50" suffix="USD" />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#A0A0A0]">Region</TableHead>
              <TableHead className="text-[#A0A0A0]">Rate / 1K views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payoutRates.map((r, i) => (
              <TableRow key={r.region} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                <TableCell className="text-white">{r.region}</TableCell>
                <TableCell className="text-[#84CC16]">{r.rate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Panel title="Admin Roles & Permissions">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#A0A0A0]">Name</TableHead>
              <TableHead className="text-[#A0A0A0]">Email</TableHead>
              <TableHead className="text-[#A0A0A0]">Role</TableHead>
              <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminTeam.map((m, i) => (
              <TableRow key={m.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                <TableCell className="text-white">{m.name}</TableCell>
                <TableCell className="text-[#A0A0A0]">{m.email}</TableCell>
                <TableCell>
                  <Select defaultValue={m.role}>
                    <SelectTrigger className="w-40 bg-[#141414] border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                      <SelectItem value="Moderator">Moderator</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/5 bg-transparent">Edit</Button>
                    <Button size="icon" variant="ghost" className="size-8 text-red-400 hover:bg-red-500/10"><Trash2 className="size-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Panel title="Language Management" action={<Button size="sm" className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90"><Plus className="size-4" /> Add Language</Button>}>
        <div className="divide-y divide-white/5">
          {languages.map((l) => (
            <div key={l.id} className="flex items-center justify-between py-3">
              <span className="text-white">{l.name}</span>
              <Switch defaultChecked={l.active} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
