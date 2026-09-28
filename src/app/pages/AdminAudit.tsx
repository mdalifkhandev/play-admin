import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";

import { useAdminAuditLogsQuery } from "../api/adminAudit.query";
import type { AdminAuditLog } from "../api/adminAudit";
import { PageHeader, Pagination, Panel, SectionLoading, StatusPill, TableLoadingRow } from "../components/shared";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const resources = [
  "all",
  "users",
  "creators",
  "moderation",
  "content",
  "ads",
  "monetization",
  "coins",
  "subscriptions",
  "notifications",
  "announcements",
  "settings",
  "support-requests",
];

export function AdminAudit({ accessToken }: { accessToken: string }) {
  const [page, setPage] = useState(1);
  const [resource, setResource] = useState("all");
  const [action, setAction] = useState("");
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const params = useMemo(
    () => ({
      page,
      limit: 20,
      resource: resource === "all" ? undefined : resource,
      action: action.trim() || undefined,
    }),
    [action, page, resource],
  );
  const logsQuery = useAdminAuditLogsQuery(accessToken, params);
  const logs = logsQuery.data?.data ?? [];
  const meta = logsQuery.data?.meta;

  return (
    <div>
      <PageHeader title="Admin Audit Logs" subtitle="Track sensitive admin activity and security changes" />

      <Panel>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A0A0A0]" />
            <Input
              value={action}
              onChange={(event) => {
                setAction(event.target.value);
                setPage(1);
              }}
              placeholder="Search action"
              className="pl-9 bg-[#111] border-white/10"
            />
          </div>
          <Select
            value={resource}
            onValueChange={(value) => {
              setResource(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[220px] bg-[#111] border-white/10">
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              {resources.map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "all" ? "All resources" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="border-white/10 bg-transparent hover:bg-white/5"
            onClick={() => void logsQuery.refetch()}
            disabled={logsQuery.isFetching}
          >
            {logsQuery.isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logsQuery.isLoading ? (
              <TableLoadingRow colSpan={7} label="Loading audit logs..." />
            ) : logs.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={7} className="py-10 text-center text-[#A0A0A0]">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={getLogId(log)} className="border-white/5 hover:bg-white/[0.03]">
                  <TableCell>
                    <div className="font-medium text-white">{log.adminId?.profile?.displayName || log.adminId?.email || "Admin"}</div>
                    <div className="text-xs text-[#A0A0A0]">{log.adminId?.role || "staff"}</div>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate text-white">{log.action}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{log.resource}</TableCell>
                  <TableCell>
                    <StatusPill status={getStatus(log)} />
                  </TableCell>
                  <TableCell className="text-[#A0A0A0]">{log.ipAddress || "-"}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{formatDate(log.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 bg-transparent hover:bg-white/5"
                      onClick={() => setSelectedLog(log)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {logsQuery.isFetching && !logsQuery.isLoading ? <SectionLoading label="Updating audit logs..." className="py-4" /> : null}
        {meta && meta.totalPages > 1 ? <Pagination page={meta.page} total={meta.totalPages} onChange={setPage} /> : null}
      </Panel>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#84CC16]" />
              Audit Details
            </DialogTitle>
            <DialogDescription>{selectedLog?.action}</DialogDescription>
          </DialogHeader>
          <pre className="max-h-[520px] overflow-auto rounded-lg border border-white/10 bg-black/30 p-4 text-xs leading-5 text-[#E8E8E8]">
            {JSON.stringify(selectedLog, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getLogId(log: AdminAuditLog) {
  return log.id || log._id || `${log.action}-${log.createdAt}`;
}

function getStatus(log: AdminAuditLog) {
  return log.details?.succeeded === false ? "Rejected" : "Completed";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
